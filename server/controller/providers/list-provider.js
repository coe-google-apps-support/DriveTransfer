const mongoose = require('mongoose');
const ListTask = require('../../model/schemas/list.js');
const uuid = require('uuid/v1');
const TaskStates = require('../../model/tasks/task-states.js');

class ListProvider {

  static create(userID, folderID) {
    return ListTask.create({userID, folderID}).catch((err) => {
      console.error('Failed creating task.');
      throw err;
    });
  }

  static getResult(taskID, userID) {
    return ListTask.findById(taskID).then((task) => {
      return task.result;
    });
  }

  static addResult(taskID, userID, value) {
    return ListTask.findById(taskID).then((task) => {
      task.result.push(value);
      return task.save();
    });
  }

}

module.exports = ListProvider;
