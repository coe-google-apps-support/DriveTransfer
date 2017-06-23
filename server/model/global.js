const TaskManager = require('./tasks/task-manager.js');
const Users = require('./authorized-users.js');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/admin';

let users;
let taskManager;
let mongoClient;

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

exports.getMongoClient = function() {
  if (!mongoClient) {
    mongoClient = MongoClient.connect(url);
  }

  return mongoClient;
}

exports.mongoURL = url;
