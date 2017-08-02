const UserProvider = require('./user-provider.js');
const TransferFilterTask = require('../schemas/transfer-filter.js');
const Google = require('googleapis');

class TransferFilterProvider {

  static create(transferID, userID) {
    return TransferFilterTask.create({
      transferTask: transferID,
      userID: userID,
    });
  }

  static getGmail(taskID) {
    return TransferFilterTask.findOne({task: taskID}).then((task) => {
      return UserProvider.getUser(task.userID);
    }).then((user) => {
      return Google.gmail({version: 'v1', auth: user.client});
    });
  }

  static setDone(taskID) {
    return TransferFilterTask.findOne({task: taskID}).then((task) => {
      task.isFiltered = true;
      return task.save();
    });
  }
};

module.exports = TransferFilterProvider;
