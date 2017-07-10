const Google = require('googleapis');
const exponentialBackoff = require('../../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('./task.js');
const TaskStates = require('./task-states.js');
const List = require('./list.js');
const G = require('../global.js');
const getRequestEmail = require('../../util/build-email.js').buildRequestEmail;

const MAX_TRIES = 4;
const NAPTIME = 2000;
const RECENT_ITEMS = 10;

const TransferStates = {
  UNTRANSFERED: 'UNTRANSFERED',
  TRANSFERED: 'TRANSFERED',
};

const TaskSubStates = {
  CREATED: TaskStates.CREATED,
  EMAIL_SENT: 'EMAIL_SENT',
  RECIPIENT_ACCEPTED: 'RECIPIENT_ACCEPTED',
}

class Transfer extends Task {
  constructor(userID, taskID, folderID, newOwner) {
    super(userID, taskID);
    this.drive = null;
    this.newOwner = newOwner;
    this.folderID = folderID;

    this.recent = {};
    this.recent.changes = [];
    this.result.fileList = {};

    this.subState = TaskSubStates.CREATED;

    this.listTask = new List(userID, taskID, folderID);
    this.listTask.result.state = TaskStates.RUNNING;

    this._it = this.changeOwner(this.listTask.result.fileList, newOwner);
  }

  setup() {
    return super.setup().then(() => {
      this.drive = Google.drive({ version: 'v3', auth: this.client });
      this.gmail = Google.gmail({ version: 'v1', auth: this.client });
    }).then(() => {
      return this.listTask.setup();
    });
  }

  authorize(recipientID) {
    return G.getUsers().getUser(recipientID).then((user) => {
      this.recipient = user;

      this.subState = TaskSubStates.RECIPIENT_ACCEPTED;
      this.run();

      this.recipientDrive = Google.drive({ version: 'v3', auth: user.client });
      this.recipientGmail = Google.gmail({ version: 'v1', auth: user.client });
      // Start task if paused.
      return user;
    });
  }

  /**
  * This is the overridden function from the parent Task class. This does a single iteration of the list operation.
  * In this case, this involves grabbing the current id and it's children. Every call to this function is a call
  * to Google's Drive API. Rate limiting this function can help deal with overages.
  *
  * @return {Promise} A Promise that has a string id as it's response value.
  */
  async doUnitOfWork() {
    if (this.subState === TaskSubStates.CREATED) {
      // Send email
      await this.sendRequest(this.newOwner).next();
      this.subState = TaskSubStates.EMAIL_SENT;
    }
    else if (this.subState === TaskSubStates.EMAIL_SENT) {
      // Setup recipient credentials.
      console.log('Still waiting on credentials');
      this.result.state = TaskStates.PAUSED;
      this.recent.state = TaskStates.PAUSED;
    }
    else if (this.listTask.result.state === TaskStates.RUNNING) {
      let file = await this.listTask.doUnitOfWork();

      if (file === undefined) return;

      file.state = TransferStates.UNTRANSFERED;
      return;
    }
    else {
      let transferYield = this._it.next();
      await transferYield.value;

      if (transferYield.done) {
        this.result.state = TaskStates.FINISHED;
        this.recent.state = TaskStates.FINISHED;
        this.emit(TaskStates.FINISHED);
      }
      else {
        transferYield.value.then((value) => {
          this.addResult(value);
        }).catch((err) => {
          console.log(err);
        });
      }

      return;
    }
  }

  addResult(value) {
    this.result.fileList[value.id] = value;
    value.file.state = TransferStates.TRANSFERED;
    this.recent.changes = [value, ...this.recent.changes.slice(0, RECENT_ITEMS - 1)];
  }

  /**
  * This function changes the owner of a Google Drive file.
  * TODO Currently, every transfer results in an email AND in a new link to the file
  * being placed at the root of the users Drive.
  *
  * @param {Object} fileList An Object containing all the Files.
  * @param {string} to The user to receive ownership.
  * @return {Promise} A Promise that has a JSON object as the result.
  */
  *changeOwner(fileList, to) {
    let entries = Object.entries(fileList);

    for (let index = 0; index < entries.length; index++) {
      yield exponentialBackoff(() => {
        let [id, file] = entries[index];

        return new Promise((resolve, reject) => {
          this.drive.permissions.create({
            fileId: id,
            transferOwnership: true,
            resource: {
              emailAddress: to,
              role: 'owner',
              type: 'user'
            }
          }, function(err, response) {
            if (err != null) {
              reject(err);
              return;
            }

            resolve({
              response,
              id,
              index,
              file,
            });
          });
        });
      }, MAX_TRIES, NAPTIME);
    }
  }

  *createFilter() {
    yield exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.drive.permissions.create({},
          function(err, response) {
            if (err != null) {
              reject(err);
              return;
            }

            resolve();
        });
      });
    }, MAX_TRIES, NAPTIME);
  }

  *sendRequest(recipient) {
    yield getRequestEmail(recipient, this.folderID, 'jared.rewerts@edmonton.ca', this.id).then((result) => {
      let encodedEmailBody = new Buffer(result).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      return exponentialBackoff(() => {
        return new Promise((resolve, reject) => {
          this.gmail.users.messages.send({
            userId: 'me',
            resource: {
              raw: encodedEmailBody
            },
            media: {
              mimeType: 'message/rfc822'
            },
          },
          function(err, response) {
            if (err != null) {
              console.log(err);
              reject(err);
            }

            resolve(response);
          });
        })
      }, MAX_TRIES, NAPTIME);
    });
  }

  *cleanFiles() {
    yield exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.drive.permissions.create({},
          function(err, response) {
            if (err != null) {
              reject(err);
              return;
            }

            resolve();
        });
      });
    }, MAX_TRIES, NAPTIME);
  }

}

module.exports = Transfer;
