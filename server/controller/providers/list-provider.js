const mongoose = require('mongoose');
const ListTask = mongoose.model('list_task');
const uuid = require('uuid/v1');
const TaskStates = require('../../model/tasks/task-states.js');

class ListProvider {
  constructor() {

  }

  create(userID, folderID) {
    const taskID = uuid();
    return List.create({taskID, userID, folderID}).catch((err) => {
      console.err('Failed creating task.');
    });
  }

  run(taskID, userID) {
    // Set state and emit event.
    return ListTask.findById(taskID).then((task) => {
      task.state = TaskStates.RUNNING;
      return task.save();
    });
  }

  pause(taskID, userID) {
    // Set state and emit event.
    return ListTask.findById(taskID).then((task) => {
      task.state = TaskStates.PAUSED;
      return task.save();
    });
  }

  getResult(taskID, userID) {
    return ListTask.findById(taskID).then((task) => {
      return task.result;
    });
  }

}
