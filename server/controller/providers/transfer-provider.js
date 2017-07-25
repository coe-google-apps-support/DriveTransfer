const mongoose = require('mongoose');
const TransferTask = require('../../model/schemas/transfer.js');
const uuid = require('uuid/v1');
const TaskStates = require('../../model/tasks/task-states.js');

class TransferProvider {

  static create(userID, folderID, newOwner) {
    return TransferTask.create({userID, folderID, newOwner}).catch((err) => {
      console.error('Failed creating task.');
      throw err;
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
