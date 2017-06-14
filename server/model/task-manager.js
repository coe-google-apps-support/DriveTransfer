let Task = require('./task.js');

class TaskManager {
  constructor() {

  }

  /**
   * Gets a Task by ID. These tasks don't need a user session to keep running.
   *
   * @param {string} taskID A unique id for a given task.
   * @return {Task} The task given by taskID.
   */
  getTask(taskID) {

  }

  /**
   * Gets all of a given users tasks.
   * For now, the userID will simply be the email of the user.
   * TODO ensure requesting user has permissions to retrieve a task.
   *
   * @param {string} userID The ID of a given user.
   * @return {Array<Task>} An Array of Tasks belonging to userID.
   */
  getUserTasks(userID) {

  }
}

module.exports = TaskManager;
