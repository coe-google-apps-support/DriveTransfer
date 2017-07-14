const Google = require('googleapis');
const exponentialBackoff = require('../../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('./task.js');
const TaskStates = require('./task-states.js');
const List = require('./list.js');
const G = require('../global.js');
const getRequestEmail = require('../../util/build-email.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;
const RECENT_ITEMS = 10;

const EMAIL_MESSAGE = 'drive-transfer-notification-email';
const FILTER_QUERY = `"${EMAIL_MESSAGE}"`;
const FILE_PATH = './resources/request-email.txt';

const TransferStates = {
  UNTRANSFERED: 'UNTRANSFERED',
  TRANSFERED: 'TRANSFERED',
};

const TaskSubStates = {
  CREATED: TaskStates.CREATED,
  EMAIL_SENT: 'EMAIL_SENT',
  RECIPIENT_ACCEPTED: 'RECIPIENT_ACCEPTED',
  EMAIL_FILTER_CREATED: 'EMAIL_FILTER_CREATED',
}

class Transfer extends Task {
  constructor(userID, taskID, folderID, newOwner) {
    super(userID, taskID);
    this.drive = null;
    this.newOwner = newOwner;
    this.folderID = folderID;

    this.recent = {};
    this.recent.changes = [];
    this.result.fileList = new Map();

    this.subState = TaskSubStates.CREATED;

    this.listTask = new List(userID, taskID, folderID);
    this.listTask.result.state = TaskStates.RUNNING;

    this._transferPredicate = this._transferPredicate.bind(this);
    this.activeFileIterator = this.listTask.result.fileList[Symbol.iterator]();
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

      this.recipientDrive = Google.drive({ version: 'v3', auth: user.client });
      this.recipientGmail = Google.gmail({ version: 'v1', auth: user.client });

      this.subState = TaskSubStates.RECIPIENT_ACCEPTED;
      this.run();

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
    console.log('Doing work');
    if (this.subState === TaskSubStates.CREATED) {
      // Send email
      console.log('Email sent');
      await this.sendRequest(this.newOwner).next().value;
      this.subState = TaskSubStates.EMAIL_SENT;
    }
    else if (this.subState === TaskSubStates.EMAIL_SENT) {
      console.log('Still waiting on credentials');
      this.result.state = TaskStates.PAUSED;
      this.recent.state = TaskStates.PAUSED;
    }
    else if (this.subState === TaskSubStates.RECIPIENT_ACCEPTED) {
      console.log('Got creds. Will filter.');
      await this.createFilter().next().value;
      this.subState = TaskSubStates.EMAIL_FILTER_CREATED;
    }
    else if (this.listTask.result.state === TaskStates.RUNNING) {
      console.log('Listing')
      let file = await this.listTask.doUnitOfWork();

      if (file === undefined) return;

      file.state = TransferStates.UNTRANSFERED;
    }
    else {
      console.log('Transferring');
      let iteratorItem = this.activeFileIterator.next();

      if (iteratorItem.done) {
        this.result.state = TaskStates.FINISHED;
        this.recent.state = TaskStates.FINISHED;
        this.emit(TaskStates.FINISHED);
        return;
      }

      let [fileID, listValue] = iteratorItem.value;
      let transferMetadata = await this.changeOwner(listValue, this.newOwner).next().value;
      await this.removeFileFromRoot(fileID).next().value;

      this.addResult(transferMetadata);
    }
  }

  addResult(value) {
    this.result.fileList.set(value.id, value);
    value.file.state = TransferStates.TRANSFERED;
    this.recent.changes = [value, ...this.recent.changes.slice(0, RECENT_ITEMS - 1)];
  }

  _transferPredicate(error) {
    let firstError = error.errors[0];
    if ((error.code === 403 && firstError.reason === 'userRateLimitExceeded') ||
      (error.code === 403 && firstError.reason === 'rateLimitExceeded') ||
      (error.code === 429 && firstError.reason === 'rateLimitExceeded') ||
      (error.code === 500 && firstError.reason === 'backendError')) {
        console.log('Retrying');
      return true;
    }

    console.log('Don\'t retry');
    return false;
  }

  /**
  * This function changes the owner of a Google Drive file.
  *
  * @param {Object} file An Object containing the file's metadata.
  * @param {string} to The user to receive ownership.
  * @return {Promise} A Promise that has a JSON object as the result.
  */
  *changeOwner(file, to) {
    yield exponentialBackoff(() => {
      let id = file.id;

      return new Promise((resolve, reject) => {
        this.drive.permissions.create({
          fileId: id,
          transferOwnership: true,
          emailMessage: EMAIL_MESSAGE,
          resource: {
            emailAddress: to,
            role: 'owner',
            type: 'user',
          },
        }, function(err, response) {
          if (err != null) {
            reject(err);
            return;
          }

          resolve({
            response,
            id,
            file,
          });
        });
      });
    }, MAX_TRIES, NAPTIME, this._transferPredicate);
  }

  *createFilter() {
    yield exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.recipientGmail.users.settings.filters.create({
          userId: 'me',
          resource: {
            action: {
              addLabelIds: ['TRASH'],
            },
            criteria: {
              query: FILTER_QUERY
            }
          }
        },
        function(err, response) {
          if (err != null && err.code === 400) {
            // The filter already existed.
            resolve();
            return;
          }
          else if (err != null) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    }, MAX_TRIES, NAPTIME);
  }

  *sendRequest(recipient) {
    yield getRequestEmail(FILE_PATH, recipient, this.folderID, 'jared.rewerts@edmonton.ca', this.id).then((result) => {
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
              return;
            }

            resolve(response);
          });
        })
      }, MAX_TRIES, NAPTIME);
    });
  }

  /**
   * This function removes a given file (by id) from the root of the RECIPIENTS drive.
   * It is usually used to manage the unneeded duplicate links that are created all over.
   *
   * @param {string} fileID The ID of the File resource.
   * @return {Promise} This function yields a Promise.
   */
  *removeFileFromRoot(fileID) {
    yield exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.recipientDrive.files.update({
          fileId: fileID,
          removeParents: 'root'
        },
          function(err, response) {
            if (err != null) {
              reject(err);
              return;
            }

            resolve();
        });
      });
    }, MAX_TRIES, NAPTIME, this._transferPredicate);
  }

}

module.exports = Transfer;
