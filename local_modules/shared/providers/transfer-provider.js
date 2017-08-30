const TransferTask = require('../schemas/transfer.js');
const TaskStates = require('../task-states.js');
const UserProvider = require('./user-provider.js');
const TaskProvider = require('./task-provider.js');
const RequestProvider = require('./transfer-request-provider.js');
const FilterProvider = require('./transfer-filter-provider.js');
const TransferResult = require('../schemas/transfer-result.js')
const Google = require('googleapis');
const mongoose = require('../mongoose-provider.js').get();

const TaskSubStates = {
  SENDING_EMAIL: 'Sending email to recipient',
  CREATING_FILTER: 'Creating email filter',
  LISTING: 'Finding files',
  TRANSFERRING: 'Transferring files',
  FINISHED: 'Done'
};

class TransferProvider {

  static create(userID, folderID, newOwner) {
    return TransferTask.create({
      userID,
      folderID,
      newOwnerEmail: newOwner,
    }).catch((err) => {
      console.log('Failed creating task.');
      throw err;
    });
  }

  static createFilter(taskID) {
    let filter;
    return this.getRequestTask(taskID).then((requestTask) => {
      return RequestProvider.getRecipientID(requestTask);
    }).then((userID) => {
      return FilterProvider.create(taskID, userID);
    }).then((filterTask) => {
      filter = filterTask;
      return TransferTask.findOne({task: taskID});
    }).then((task) => {
      task.filterTask = filter.task;
      return task.save();
    }).then(() => {
      return filter;
    });
  }

  static getFolder(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return task.folderID;
    });
  }

  static getNewOwnerEmail(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return task.newOwnerEmail;
    });
  }

  static getRequestTask(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return task.requestTask;
    });
  }

  static getListTask(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return task.listTask;
    });
  }

  static getFilterTask(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return task.filterTask;
    });
  }

  static getDrive(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return UserProvider.getUser(task.userID);
    }).then((user) => {
      let client = user.client;
      return Google.drive({version: 'v3', auth: client});
    });
  }

  static getRecipientDrive(taskID) {
    return this.getRequestTask(taskID).then((task) => {
      return RequestProvider.getRecipientDrive(task);
    });
  }

  static addResult(taskID, fileID) {
    return TransferResult.create({
      task: taskID,
      id: fileID,
    });
  }

  static getResult(taskID, fileID) {
    return TransferResult.findOne({task: taskID, id: fileID});
  }

  static getSubstate(taskID) {
    taskID = mongoose.Types.ObjectId(taskID);
    console.log(taskID);

    return TransferTask.findOne({task: taskID}).then((task) => {
      return Promise.all([
        TaskProvider.getState(task.requestTask),
        TaskProvider.getState(task.filterTask).catch(() => {}),
        TaskProvider.getState(task.listTask),
        TaskProvider.getState(task.task),
      ]);
    }).then((states) => {
      if (states[3] === TaskStates.FINISHED) {
        return TaskSubStates.FINISHED;
      }
      else if (states[2] === TaskStates.FINISHED) {
        return TaskSubStates.TRANSFERRING;
      }
      else if (states[1] === TaskStates.FINISHED) {
        return TaskSubStates.LISTING;
      }
      else if (states[0] === TaskStates.FINISHED) {
        return TaskSubStates.CREATING_FILTER;
      }

      return 'Waiting on new owner\'s approval';
    });
  }

}

module.exports = TransferProvider;
