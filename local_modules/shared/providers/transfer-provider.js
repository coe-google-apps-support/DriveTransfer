const TransferTask = require('../schemas/transfer.js');
const TaskStates = require('../task-states.js');
const UserProvider = require('./user-provider.js');
const TaskProvider = require('./task-provider.js');
const RequestProvider = require('./transfer-request-provider.js');
const FilterProvider = require('./transfer-filter-provider.js');
const TransferResult = require('../schemas/transfer-result.js')
const Google = require('googleapis');

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

  static getRequestID(taskID) {
    return this.getRequestTask(taskID).then((taskID) => {
      return TaskProvider.getSubTask(taskID);
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

}

module.exports = TransferProvider;
