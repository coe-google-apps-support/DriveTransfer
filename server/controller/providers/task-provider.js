const Tasks = {
  'list_task': require('./list-provider.js')
}
const mongoose = require('mongoose');
const Task = mongoose.model('task');

class TaskProvider {

  /**
   * Adds a new Transfer Task.
   * TODO Put this in TransferProvider
   * @param {string} userID The ID of the initiating user.
   * @param {string} folderID The id of the folder to list.
   * @param {string} newOwner The email address of the owner to transfer to.
   * @return {string} The id of this task.
   */
  addTransferTask(userID, folderID, newOwner) {

  }

  /**
   * Accepts or rejects an existing Transfer Task.
   * TODO Pu this in a TransferProvider
   * @param {string} initiatorEmail The email of the initiating user.
   * @param {string} folderID The id of the folder to list.
   * @param {string} newOwnerEmail The email address of the owner to transfer to.
   * @param {string} newOwnerID The ID of the new owner.
   * @param {string} taskID The Task to accept or reject.
   * @return {Promise} The id of this task wrapped in a Promise.
   */
  authTransferTask(initiatorEmail, folderID, newOwnerEmail, newOwnerID, taskID) {

  }

  /********** Generic Tasks **********/

  /**
   * Runs a Task.
   * @param {string} taskID The ID of the Task to run.
   * @return {Promise} A Promise resolved after the Task is run.
   */
  runTask(taskID, userID) {
    Task.findById(taskID).then((task) => {
      Tasks[task.taskType].run(taskID, userID);
    });
  }

  /**
   * Pauses a Task.
   * @param {string} taskID The ID of the Task to pause.
   * @return {Promise} A Promise resolved after the Task is paused.
   */
  pauseTask(taskID, userID) {
    Task.findById(taskID).then((task) => {
      Tasks[task.taskType].pause(taskID, userID);
    });
  }

  /**
   * Gets the results of a given task.
   *
   */
  getResult(taskID, userID) {
    Task.findById(taskID).then((task) => {
      Tasks[task.taskType].getResult(taskID, userID);
    });
  }
}
