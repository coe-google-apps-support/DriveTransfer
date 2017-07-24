const mongoose = require('mongoose');
const ListTask = mongoose.model('list_task');
const uuid = require('uuid/v1');
const TaskStates = require('../../model/tasks/task-states.js');

class ListProvider {

  static create(userID, folderID) {
    const taskID = uuid();
    return ListTask.create({taskID, userID, folderID}).catch((err) => {
      console.err('Failed creating task.');
    });
  }

  static run(taskID, userID) {
    // Set state and emit event.
    return ListTask.findOne({taskID}).then((task, second) => {
      task.state = TaskStates.RUNNING;
      return task.save();
    });
  }

  static pause(taskID, userID) {
    // Set state and emit event.
    return ListTask.findOne({taskID}).then((task) => {
      task.state = TaskStates.PAUSED;
      return task.save();
    });
  }

  static getResult(taskID, userID) {
    return ListTask.findOne({taskID}).then((task) => {
      return task.result;
    });
  }

  static addResult(taskID, userID, value) {
    return ListTask.findOne({taskID}).then((task) => {
      task.result.push(value);
      return task.save();
    });
  }

}

module.exports = ListProvider;
