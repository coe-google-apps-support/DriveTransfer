const Google = require('googleapis');
const exponentialBackoff = require('../../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('./task.js');
const TaskStates = require('./task-states.js');
const List = require('./list.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;
const RECENT_ITEMS = 10;

const TransferStates = {
  UNTRANSFERED: 'UNTRANSFERED',
  TRANSFERED: 'TRANSFERED',
};

class Transfer extends Task {
  constructor(userID, taskID, folderID, newOwner) {
    super(userID, taskID);
    this.drive = Google.drive({ version: 'v3', auth: this.client });

    this.listTask = new List(userID, taskID, folderID);
    this.listTask.result.state = TaskStates.RUNNING;
    this.recent = [];
    this.result.fileList = {};

    this._it = this.changeOwner(this.listTask.result.fileList, newOwner);
  }

  /**
  * This is the overridden function from the parent Task class. This does a single iteration of the list operation.
  * In this case, this involves grabbing the current id and it's children. Every call to this function is a call
  * to Google's Drive API. Rate limiting this function can help deal with overages.
  *
  * @return {Promise} A Promise that has a string id as it's response value.
  */
  async doUnitOfWork() {
    if (this.listTask.result.state === TaskStates.RUNNING) {
      let file = await this.listTask.doUnitOfWork();

      if (file === undefined) return;

      console.log('list');
      file.state = TransferStates.UNTRANSFERED;
      return;
    }
    else {
      let transferYield = this._it.next();
      await transferYield.value;

      console.log('transfer');
      if (transferYield.done) {
        this.result.state = TaskStates.FINISHED;
        this.emit(TaskStates.FINISHED);
      }
      else {
        transferYield.value.then((value) => {
          console.log('transfer yield');
          console.log(value);
          this.addResult(value);
        }).catch((err) => {
          console.log(err);
        });
      }

      return;
    }
  }

  getRecentWork() {
    return this.recent;
  }

  addResult(value) {
    console.log('adding');
    this.result.fileList[value.id] = value;
    value.file.state = TransferStates.TRANSFERED;
    this.recent = [value, ...this.recent.slice(0, RECENT_ITEMS - 1)];
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

}

module.exports = Transfer;
