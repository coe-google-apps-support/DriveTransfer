const G = require('../model/global.js');
const taskManager = require('../model/tasks/task-manager.js');

exports.run = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  G.getUsers().getUser(req.sessionID).then((user) => {
    return user.promise;
  }).then(() => {
    return taskManager.runTask(taskID);
  }).then(() => {
    res.status(200).json({
      message: 'Task run'
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.pause = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  G.getUsers().getUser(req.sessionID).then((user) => {
    return user.promise;
  }).then(() => {
    return taskManager.pauseTask(taskID);
  }).then(() => {
    res.status(200).json({
      message: 'Task paused'
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.getResult = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  G.getUsers().getUser(req.sessionID).then((user) => {
    return user.promise;
  }).then(() => {
    return taskManager.getTaskResult(taskID);
  }).then((result) => {
    res.status(200).json({
      message: result
    });
  }).catch((err) => {
    console.log(err);
  });
}
