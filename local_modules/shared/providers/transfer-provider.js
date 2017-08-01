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

}

module.exports = TransferProvider;
