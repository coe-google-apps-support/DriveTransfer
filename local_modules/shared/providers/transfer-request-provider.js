const UserProvider = require('./user-provider.js');
const TransferRequestTask = require('../schemas/transfer-request.js');
const Google = require('googleapis');
const Config = require('../config.js');

class TransferRequestProvider {

  static rejectTransfer(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      task.status = 'rejected';
      return task.save();
    });
  }

  static acceptTransfer(taskID) {
    return TransferRequestTask.findOne({task: taskID}).then((task) => {
      task.status = 'accepted';
      return task.save();
    });
  }

  static getAppGmail() {
    return UserProvider.getUser(Config.App.USER_ID).then((user) => {
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
};

module.exports = TransferRequestProvider;
