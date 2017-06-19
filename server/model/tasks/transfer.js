const Google = require('googleapis');
const exponentialBackoff = require('../../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('./task.js');
const TaskStates = require('./task-states.js');
const List = require('./list.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;

const TransferStates = {
  UNTRANSFERED: 'UNTRANSFERED',
  TRANSFERED: 'TRANSFERED',
};

class Transfer extends Task {
  constructor(userID, taskID, folderID, newOwner) {
    super(userID, taskID);
    this.drive = Google.drive({ version: 'v3', auth: this.client });

    this.listTask = new List(userID, taskID, folderID);
    this.listTask.state = TaskStates.RUNNING;
    this.result.transfers = {};
    this.result.transfers.ids = this.listTask.result.idList;
    this.result.transfers.state = [];

    this._it = this.changeOwner(this.result.transfers.ids, newOwner);
  }

  /**
  * This is the overridden function from the parent Task class. This does a single iteration of the list operation.
  * In this case, this involves grabbing the current id and it's children. Every call to this function is a call
  * to Google's Drive API. Rate limiting this function can help deal with overages.
  *
  * @return {Promise} A Promise that has a string id as it's response value.
  */
  async doUnitOfWork() {
    if (this.listTask.state === TaskStates.RUNNING) {
      let id = await this.listTask.doUnitOfWork();

      if (id === undefined) return;

      this.result.transfers.state.push(TransferStates.UNTRANSFERED);
      console.log('LIST');
      return;
    }
    else {
      let transferYield = this._it.next();
      await transferYield.value;

      if (transferYield.done) {
        this.state = TaskStates.FINISHED;
        this.emit(TaskStates.FINISHED);
      }
      else {
        transferYield.value.then((value) => {
          this.result.transfers.state[value.index] = TransferStates.TRANSFERED;
        }).catch((err) => {
          console.log(err);
        });
      }

      return;
    }
  }

  /**
  * This function changes the owner of a Google Drive file.
  * TODO Currently, every transfer results in an email AND in a new link to the file
  * being placed at the root of the users Drive.
  *
  * @param {string} id The id of a Google Drive file or folder.
  * @param {string} to The user to receive ownership.
  * @return {Promise} A Promise that has a JSON object as the result.
  */
  *changeOwner(ids, to) {
    for (let index = 0; index < ids.length; index++) {
      yield exponentialBackoff(() => {
        let id = ids[index];

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
            });
          });
        });
      }, MAX_TRIES, NAPTIME);
    }
  }

}

module.exports = Transfer;
