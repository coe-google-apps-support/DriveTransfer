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
      if (task.state === TaskStates.CREATED) {
        task.state = TaskStates.RUNNING;
        return task.save();
      }

      throw new Error(`Cannot run task from ${task.state}.`);
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

  /**
   * Finishes a Task.
   * @param {string} taskID The ID of the Task to finish.
   * @return {Promise} A Promise resolved after the Task is finished.
   */
  static finish(taskID) {
    return Task.findById(taskID).then((task) => {
      if (task.state === TaskStates.FAILED ||
      task.state === TaskStates.FINISHED) {
        throw new Error(`Cannot finish task from ${task.state}.`);
      }

      task.state = TaskStates.FINISHED;
      return task.save();
    });
  }

  /**
   * Fails a Task.
   * @param {string} taskID The ID of the Task to fail.
   * @return {Promise} A Promise resolved after the Task is failed.
   */
  static fail(taskID) {
    return Task.findById(taskID).then((task) => {
      task.state = TaskStates.FAILED;
      return task.save();
    });
  }

  /**
   * Cancels a Task.
   * @param {string} taskID The ID of the Task to cancel.
   * @return {Promise} A Promise resolved after the Task is cancelled.
   */
  static cancel(taskID) {
    return Task.findById(taskID).then((task) => {
      task.state = TaskStates.CANCELLED;
      return task.save();
    });
  }

  /**
   * Gets the subtask associated with this task.
   * @param {string} taskID The ID of the task.
   * @return {string} The ID of the subtask.
   */
  static getSubTask(taskID) {
    return Task.findById(taskID).then((task) => {
      return task.subTask;
    });
  }

  /**
   * Gets the state of a created task.
   * @param {string} taskID The ID of the task.
   * @return {string} The state of the task. See shared/task-states.js.
   */
  static getState(taskID) {
    return Task.findById(taskID).then((task) => {
      return task.state;
    });
  }
}

module.exports = TaskProvider;
