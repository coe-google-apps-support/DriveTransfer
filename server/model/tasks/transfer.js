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

const TaskSubStates = {
  SENDING_EMAIL: 'Sending email to recipient',
  WAITING_FOR_CREDENTIALS: 'Waiting on recipient',
  CREATING_FILTER: 'Creating email filter',
  LISTING: 'Finding files',
  TRANSFERRING: 'Transferring files',
  FINISHED: 'Done'
}

class Transfer extends Task {
  constructor(userID, taskID, folderID, newOwner) {
    super(userID, taskID);
    this.drive = null;
    this.newOwner = newOwner;
    this.folderID = folderID;

    //this.result.fileList = new Map();

    this.subState = TaskSubStates.SENDING_EMAIL;

    this.listTask = new List(userID, taskID, folderID);
    this.listTask.state = TaskStates.RUNNING;
    this.result = this.listTask.result;

    this._transferPredicate = this._transferPredicate.bind(this);
    this.activeFileIterator = this.listTask.result.fileList[Symbol.iterator]();
  }

  static fromDB(mdbTransfer) {
    let task = new Transfer(mdbTransfer.userID, mdbTransfer.taskID, mdbTransfer.folderID, mdbTransfer.newOwner);

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

      this.subState = TaskSubStates.CREATING_FILTER;
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
    if (this.subState === TaskSubStates.SENDING_EMAIL) {
      // Send email
      console.log('Email sent');
      await this.sendRequest(this.newOwner).next().value;
      this.subState = TaskSubStates.WAITING_FOR_CREDENTIALS;
    }
    else if (this.subState === TaskSubStates.WAITING_FOR_CREDENTIALS) {
      console.log('Still waiting on credentials');
      this.state = TaskStates.PAUSED;
    }
    else if (this.subState === TaskSubStates.CREATING_FILTER) {
      console.log('Got creds. Will filter.');
      await this.createFilter().next().value;
      this.subState = TaskSubStates.LISTING;
      this.listTask.state = TaskStates.RUNNING;
    }
    else if (this.subState === TaskSubStates.LISTING) {
      console.log('Listing');
      let file = await this.listTask.doUnitOfWork();

      if (file === undefined) {
        console.log('done listing');
        this.subState = TaskSubStates.TRANSFERRING;
        return;
      }
    }
    else if (this.subState === TaskSubStates.TRANSFERRING) {
      console.log('Transferring');
      let iteratorItem = this.activeFileIterator.next();

      if (iteratorItem.done) {
        this.state = TaskStates.FINISHED;
        this.emit(TaskStates.FINISHED);
        return;
      }

      let [fileID, listValue] = iteratorItem.value;
      let transferMetadata = await this.changeOwner(listValue, this.newOwner).next().value;
      await this.removeFileFromRoot(fileID).next().value;

      this.addResult(fileID, transferMetadata);
    }
    else {
      console.log(`Weird substate: ${this.subState}`);
    }
  }

  addResult(id, value) {
    let file = this.result.fileList.get(id);
    file.permissionChange = value;
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

          resolve(response);
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
