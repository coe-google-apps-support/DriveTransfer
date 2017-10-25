const UserProvider = require('./user-provider.js');
const TransferRequestTask = require('../schemas/transfer-request.js');
const TaskProvider = require('./task-provider.js');
const Google = require('googleapis');
const Config = require('../config.js');

class TransferRequestProvider {

  static rejectTransfer(taskID, userID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      task.status = 'rejected';
      task.recipient.user = userID;
      return task.save();
    }).then(() => {
      return TaskProvider.fail(taskID);
    });
  }

  static acceptTransfer(taskID, userID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      task.status = 'accepted';
      task.recipient.user = userID;
      return task.save();
    }).then(() => {
      console.log('finishing ' + taskID);
      return TaskProvider.finish(taskID);
    });
  }

  static getAppGmail() {
    return UserProvider.getUserByEmail(Config.App.EMAIL).then((user) => {
      if (!user) {
        throw new Error('Please login as drivetransfer@edmonton.ca before starting Drive Transfer.');
      }
      
      return Google.gmail({version: 'v1', auth: user.client});
    });
  }

  static getStatus(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      return task.status;
    });
  }

  static getFolderID(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      return task.folderID;
    });
  }

  static getRecipient(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      return task.recipient.email;
    });
  }

  static getRecipientID(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      return task.recipient.user;
    });
  }

  static getRecipientDrive(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      if (!task.recipient.user) {
        throw new Error(`transfer_request_task ${taskID} has no receiving user.`);
      }

      return UserProvider.getUser(task.recipient.user);
    }).then((user) => {
      return Google.drive({version: 'v3', auth: user.client});
    });
  }
};

module.exports = TransferRequestProvider;
