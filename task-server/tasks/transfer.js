const Task = require('./task.js');
const UserProvider = require('shared/providers/user-provider.js');
const TransferProvider = require('shared/providers/transfer-provider.js');
const TaskProvider = require('shared/providers/task-provider.js');
const Config = require('shared/config.js');
const exponentialBackoff = require('shared/util/exponential-backoff.js');
const onChange = require('../notify-on-change.js');

const TaskSubStates = {
  SENDING_EMAIL: 'Sending email to recipient',
  WAITING_FOR_CREDENTIALS: 'Waiting on recipient',
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
    })
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
      return onChange('transfer_request_task', this.filterTransferRequest).then((doc) => {
        console.log('Looks like the request was updated.');
      });
    }
    else if (this.transferState === TaskSubStates.WAITING_FOR_CREDENTIALS) {
      console.log(TaskSubStates.WAITING_FOR_CREDENTIALS);
    }
    else if (this.transferState === TaskSubStates.CREATING_FILTER) {
      console.log(TaskSubStates.CREATING_FILTER);
    }
    else if (this.transferState === TaskSubStates.LISTING) {
      console.log(TaskSubStates.SENDING_EMAIL);
    }
    else if (this.transferState === TaskSubStates.TRANSFERRING) {
      console.log(TaskSubStates.LISTING);
    }
    else if (this.transferState === TaskSubStates.FINISHED) {
      console.log(TaskSubStates.FINISHED);
    }
    else {
      console.log(`Weird TransferState: ${this.transferState}`);
      this.interrupt();
    }
  }

  filterTransferRequest(doc) {
    console.log('Filtering');
    console.log(doc);
  }

}

module.exports = Transfer;
