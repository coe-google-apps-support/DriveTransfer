const Task = require('./task.js');
const UserProvider = require('shared/providers/user-provider.js');
const TransferProvider = require('shared/providers/transfer-provider.js');
const TaskProvider = require('shared/providers/task-provider.js');
const FilterProvider = require('shared/providers/transfer-filter-provider.js')
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
    this.filterFilterRequest = this.filterFilterRequest.bind(this);
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
        if (action === 'rejected') {
          // TODO reject task. Set to quit. Delete ALL associated tasks
          throw new Error('IMPLEMENT REJECTED HANDLING');
        }
        else if (action === 'accepted') {
          this.transferState = TaskSubStates.CREATING_FILTER;
          // TODO Use TransferProvider for the filter creation?
          return FilterProvider.create(this.taskID, userID);
        }
        else {
          throw new Error(`transfer_request_task must have status rejected or accepted, not ${action}`);
        }
      }).then((filterTask) => {
        this.filterID = filterTask._id;
        this.filterTask = filterTask.task;
        return TransferProvider.setFilterTask(this.taskID, this.filterTask);
      });
    }
    else if (this.transferState === TaskSubStates.WAITING_FOR_CREDENTIALS) {
      console.log(TaskSubStates.WAITING_FOR_CREDENTIALS);
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
      return new Promise((resolve, reject) => {

      });
    }
    else if (this.transferState === TaskSubStates.TRANSFERRING) {
      console.log(TaskSubStates.TRANSFERRING);
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
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.filterID.toString() &&
      doc.o && doc.o.$set && doc.o.$set.isFiltered) {

      return true;
    }

    return false;
  }

}

module.exports = Transfer;
