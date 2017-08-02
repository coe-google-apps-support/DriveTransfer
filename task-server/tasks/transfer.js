const Task = require('./task.js');
const UserProvider = require('shared/providers/user-provider.js');
const TransferProvider = require('shared/providers/transfer-provider.js');
const TaskProvider = require('shared/providers/task-provider.js');
const FilterProvider = require('shared/providers/transfer-filter-provider.js')
const ListProvider = require('shared/providers/list-provider.js')
const Config = require('shared/config.js');
const exponentialBackoff = require('shared/util/exponential-backoff.js');
const TaskStates = require('shared/task-states.js');
const onChange = require('../notify-on-change.js');

const TaskSubStates = {
  SENDING_EMAIL: 'Sending email to recipient',
  CREATING_FILTER: 'Creating email filter',
  LISTING: 'Finding files',
  TRANSFERRING: 'Transferring files',
  FINISHED: 'Done'
};

class Transfer extends Task {
  constructor(taskID) {
    super(taskID);
    this.taskID = taskID;
    this.whenDone = new Promise((resolve, reject) => {
      this._whenDoneResolve = resolve;
      this._whenDoneReject = reject;
    });
    this.transferState = TaskSubStates.SENDING_EMAIL;
    this.filterTransferRequest = this.filterTransferRequest.bind(this);
    this.filterFilterRequest = this.filterFilterRequest.bind(this);
    this.filterListRequest = this.filterListRequest.bind(this);
  }

  async setup() {
    return TransferProvider.getDrive(this.taskID).then((drive) => {
      if (!drive) {
        throw new Error('Transfer failed fetching drive');
      }

      this.drive = drive;
      return TransferProvider.getFolder(this.taskID);
    }).then((folderID) => {
      if (!folderID) {
        throw new Error('Transfer failed fetching folderID');
      }

      this.folderID = folderID;
      return TransferProvider.getNewOwnerEmail(this.taskID);
    }).then((owner) => {
      if (!owner) {
        throw new Error('Transfer failed fetching owner');
      }

      this.newOwnerEmail = owner;
      return TransferProvider.getRequestTask(this.taskID);
    }).then((requestTask) => {
      if (!requestTask) {
        throw new Error('Transfer failed fetching request task');
      }

      this.requestTask = requestTask;
      return TransferProvider.getRequestID(this.taskID);
    }).then((id) => {
      if (!id) {
        throw new Error('Transfer failed fetching request task id');
      }

      this.requestID = id;
      return TransferProvider.getListTask(this.taskID);
    }).then((listTask) => {
      if (!listTask) {
        throw new Error('Transfer failed fetching list task')
      }

      this.listTask = listTask;
    });
  }

  async run() {
    this.run = true;

    while (this.run) {
      await this.doWork();
    }
  }

  interrupt() {
    this.run = false;
  }

  doWork() {
    if (this.transferState === TaskSubStates.SENDING_EMAIL) {
      console.log(TaskSubStates.SENDING_EMAIL);
      TaskProvider.run(this.requestTask);
      return onChange('transfer_request_tasks', this.filterTransferRequest).then((doc) => {
        const action = doc.o.$set.status;
        const userID = doc.o.$set['recipient.user'];

        if (action === 'accepted') {
          this.transferState = TaskSubStates.CREATING_FILTER;
          // TODO Use TransferProvider for the filter creation?
          return FilterProvider.create(this.taskID, userID);
        }
        else {
          throw new Error(`transfer_request_task was rejected.`);
        }
      }).then((filterTask) => {
        this.filterID = filterTask._id;
        this.filterTask = filterTask.task;
        return TransferProvider.setFilterTask(this.taskID, this.filterTask);
      }).then(() => {
        return TransferProvider.getRecipientDrive(this.taskID).then((drive) => {
          this.recipientDrive = drive;
        });
      });
    }
    else if (this.transferState === TaskSubStates.CREATING_FILTER) {
      console.log(TaskSubStates.CREATING_FILTER);
      TaskProvider.run(this.filterTask);
      return onChange('transfer_filter_tasks', this.filterFilterRequest).then((doc) => {
        this.transferState = TaskSubStates.LISTING;
      });
    }
    else if (this.transferState === TaskSubStates.LISTING) {
      console.log(TaskSubStates.LISTING);
      TaskProvider.run(this.listTask);
      return onChange('tasks', this.filterListRequest).then((doc) => {
        this.transferState = TaskSubStates.TRANSFERRING;
        this.listValues = ListProvider.getResultCursor(this.listTask);
      });
    }
    else if (this.transferState === TaskSubStates.TRANSFERRING) {
      console.log(TaskSubStates.TRANSFERRING);

      let fileID;
      let doneError = new Error('Finished iterating list.');
      return this.listValues.next().then((file) => {
        if (!file) {
          this.transferState = TaskSubStates.FINISHED;
          throw doneError;
        }

        fileID = file.id;
        return exponentialBackoff(
          this.transfer.bind(this, fileID, this.newOwnerEmail),
          Config.ExpoBackoff.MAX_TRIES,
          Config.ExpoBackoff.NAPTIME,
          this.transferPredicate
        );
      }).then((transferResult) => {
        return TransferProvider.addResult(this.taskID, fileID);
      }).then(() => {
        return exponentialBackoff(
          this.removeFileFromRoot.bind(this, fileID),
          Config.ExpoBackoff.MAX_TRIES,
          Config.ExpoBackoff.NAPTIME,
          this.transferPredicate
        );
      }).catch((err) => {
        if (err !== doneError) {
          throw err;
        }
      });
    }
    else if (this.transferState === TaskSubStates.FINISHED) {
      console.log(TaskSubStates.FINISHED);
      this.interrupt();
      return TaskProvider.finish(this.taskID);
    }
    else {
      console.log(`Unknown TransferState: ${this.transferState}`);
      this.interrupt();
      return TaskProvider.fail(this.taskID);
    }
  }

  filterTransferRequest(doc) {
    if (doc.op === 'u' &&
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.requestID.toString() &&
      doc.o && doc.o.$set &&
      doc.o.$set.status &&
      doc.o.$set['recipient.user']) {

      return true;
    }

    return false;
  }

  filterFilterRequest(doc) {
    if (doc.op === 'u' &&
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.filterTask.toString() &&
      doc.o && doc.o.$set && doc.o.$set.state && doc.o.$set.state === TaskStates.FINISHED) {

      return true;
    }

    return false;
  }

  filterListRequest(doc) {
    if (doc.op === 'u' &&
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.listTask.toString() &&
      doc.o && doc.o.$set && doc.o.$set.state && doc.o.$set.state === TaskStates.FINISHED) {

      return true;
    }

    return false;
  }

  transferPredicate(error) {
    if (!error.errors || error.errors[0]) {
      console.log('non-api error');
      return false;
    }

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

  transfer(fileID, newOwnerEmail) {
    return new Promise((resolve, reject) => {
      this.drive.permissions.create({
        fileId: fileID,
        transferOwnership: true,
        emailMessage: Config.Tasks.Transfer.EMAIL_MESSAGE,
        resource: {
          emailAddress: newOwnerEmail,
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
  }

  removeFileFromRoot(fileID) {
    console.log(`removing ${fileID}`);
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
  }

}

module.exports = Transfer;
