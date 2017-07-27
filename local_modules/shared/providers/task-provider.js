const Task = require('../schemas/task.js');
const TaskStates = require('../task-states.js');

class TaskProvider {

  /********** Generic Tasks **********/

  /**
   * Runs a Task.
   * @param {string} taskID The ID of the Task to run.
   * @return {Promise} A Promise resolved after the Task is run.
   */
  static run(taskID) {
    return Task.findById(taskID).then((task) => {
      task.state = TaskStates.RUNNING;
      return task.save();
    });
  }

  /**
   * Pauses a Task.
   * @param {string} taskID The ID of the Task to pause.
   * @return {Promise} A Promise resolved after the Task is paused.
   */
  static pause(taskID) {
    return Task.findById(taskID).then((task) => {
      task.state = TaskStates.PAUSED;
      return task.save();
    });
  }
}

module.exports = TaskProvider;
