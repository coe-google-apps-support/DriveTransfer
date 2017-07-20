const Task = require('./task.js');
const List = require('./list.js');
const Transfer = require('./transfer.js');
const mongoose = require('mongoose');
const MongooseTransfer = mongoose.model('transfers');
const G = require('../global.js');
const uuid = require('uuid/v1');

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  /**
   * Gets a Task by ID. This Task is returned as the result of a Promise.
   * These tasks don't need an active user session to keep running.
   *
   * @param {string} taskID A unique id for a given task.
   * @return {Promise} A Promise that contains the task given by taskID.
   */
  getTask(taskID) {
    let foundTask = this.tasks.find((task) => {
      return task.id === taskID;
    });

    if (foundTask) {
      return Promise.resolve(foundTask);
    }

    return MongooseTransfer.findOne({taskID: taskID}).then((task) => {
      if (task == null) {
        throw new Error(`No task ${taskID} found.`);
      }

      return Transfer.fromDB(task);
    }).then((newTransfer) => {
      this.tasks.push(newTransfer);
      return newTransfer;
    });
  }

  /**
   * Adds a new List Task.
   *
   * @param {string} userID The ID of the requesting user.
   * @param {string} folderID The id of the folder to list.
   * @return {string} The id of this task.
   */
  addListTask(userID, folderID) {
    let task;
    return G.getUsers().getUser(userID).then((user) => {
      if (user == null) {
        throw new Error(`Couldn't find user ${userID}.`);
      }

      const taskID = uuid();
      task = new List(userID, taskID, folderID);
      return task.setup();
    }).then(() => {
      this.tasks.push(task);
      return task.id;
    });
  }

  /**
   * Adds a new Transfer Task.
   *
   * @param {string} userID The ID of the initiating user.
   * @param {string} folderID The id of the folder to list.
   * @param {string} newOwner The email address of the owner to transfer to.
   * @return {string} The id of this task.
   */
  addTransferTask(userID, folderID, newOwner) {
    let task;
    return G.getUsers().getUser(userID).then((user) => {
      if (user == null) {
        throw new Error(`Couldn't find user ${userID}.`);
      }

      const taskID = uuid();
      task = new Transfer(userID, taskID, folderID, newOwner);
      return task.setup();
    }).then(() => {
      this.tasks.push(task);
      return task.id;
    })
  }

  /**
   * Accepts or rejects an existing Transfer Task.
   *
   * @param {string} initiatorEmail The email of the initiating user.
   * @param {string} folderID The id of the folder to list.
   * @param {string} newOwnerEmail The email address of the owner to transfer to.
   * @param {string} newOwnerID The ID of the new owner.
   * @param {string} taskID The Task to accept or reject.
   * @return {Promise} The id of this task wrapped in a Promise.
   */
  authTransferTask(initiatorEmail, folderID, newOwnerEmail, newOwnerID, taskID) {
    return this.getTask(taskID).then((task) => {
      return task.authorize(newOwnerID);
    });
  }

  /**
   * Runs a Task.
   * @param {string} taskID The ID of the Task to run.
   * @return {Promise} A Promise resolved after the Task is run.
   */
  runTask(taskID) {
    return this.getTask(taskID).then((task) => {
      task.run();
    });
  }

  /**
   * Pauses a Task.
   * @param {string} taskID The ID of the Task to pause.
   * @return {Promise} A Promise resolved after the Task is paused.
   */
  pauseTask(taskID) {
    return this.getTask(taskID).then((task) => {
      task.pause();
    });
  }

  /**
   * Gets the result associated with a given task.
   * @param {string} taskID The ID of the Task to get the result for.
   * @return {Promise} The result wrapped in a Promise.
   */
  getTaskResult(taskID) {
    return this.getTask(taskID).then((task) => {
      return task.getResult();
    });
  }
}

module.exports = TaskManager;
