const TaskManager = require('./task-manager.js');
const Users = require('./authorized-users.js');

let users;
let taskManager;

exports.getUsers = function() {
  if (!users) {
    users = new Users();
  }

  return users;
}


exports.getTaskManager = function() {
  if (!taskManager) {
    taskManager = new TaskManager();
  }

  return taskManager;
}
