const Task = require('./task.js');
const List = require('./list.js');
const G = require('../global.js');
const uuid = require('uuid/v1');

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  /**
   * Gets a Task by ID. These tasks don't need a user session to keep running.
   *
   * @param {string} taskID A unique id for a given task.
   * @return {Task} The task given by taskID.
   */
  getTask(taskID) {
    let foundTask = this.tasks.find((task) => {
      return task.id === taskID;
    });

    if (foundTask === undefined) {
      console.log(`No task ${taskID} found.`);
    }

    return foundTask;
  }

  /**
   * Adds a new List Task.
   *
   * @param {string} userID The ID of the requesting user.
   * @param {string} folderID The id of the folder to list.
   * @return {string} The id of this task.
   */
  addListTask(userID, folderID) {
    if (G.getUsers().getUser(userID) == null) {
      throw new Error(`Couldn't find user ${userID}.`);
    }

    const taskID = uuid();
    let task = new List(userID, taskID, folderID);
    this.tasks.push(task);
    return taskID;
  }

  runTask(taskID) {
    let task = this.getTask(taskID);
    task.run();
  }

  pauseTask(taskID) {
    let task = this.getTask(taskID);
    task.pause();
  }

  getTaskResult(taskID) {
    let task = this.getTask(taskID);
    return task.getResult();
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
    let foundTask = this.tasks.find((task) => {
      return task.userID === userID;
    });

    if (foundTask === undefined) {
      console.log(`No tasks for ${userID} found.`);
    }

    return foundTask;
  }
}

module.exports = TaskManager;
