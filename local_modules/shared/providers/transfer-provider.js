const TransferTask = require('../schemas/transfer.js');
const TaskStates = require('../task-states.js');
const UserProvider = require('./user-provider.js');
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

  static getDrive(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      return UserProvider.getUser(task.userID);
    }).then((user) => {
      let client = user.client;
      return Google.drive({version: 'v3', auth: client});
    });
  }

  static acceptTransfer(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      task.newOwner.hasAuthorized = true;
      return task.save();
    });
  }

  static rejectTransfer(taskID) {
    return TransferTask.findOne({task: taskID}).then((task) => {
      task.newOwner.isRejected = true;
      return task.save();
    });
  }

  static getResult(taskID) {
    return TransferTask.findById(taskID).then((task) => {
      return task.result;
    });
  }

  static addResult(taskID, value) {
    return TransferTask.findById(taskID).then((task) => {
      task.result.push(value);
      return task.save();
    });
  }

}

module.exports = TransferProvider;
