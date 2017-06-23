const G = require('../model/global.js');

exports.run = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  G.getUsers().getUser(req.sessionID).then((user) => {
    return user.promise;
  }).then(() => {
    let tm = G.getTaskManager();
    tm.runTask(taskID);

    res.status(200).json({
      message: 'RUNNING'
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
    let tm = G.getTaskManager();
    tm.pauseTask(taskID);

    res.status(200).json({
      message: 'RUNNING'
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
    let tm = G.getTaskManager();
    let result = tm.getTaskResult(taskID);

    res.status(200).json({
      message: result
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.getRecentWork = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  G.getUsers().getUser(req.sessionID).then((user) => {
    return user.promise;
  }).then(() => {
    let tm = G.getTaskManager();
    let result = tm.getRecentWork(taskID);

    res.status(200).json({
      message: result
    });
  }).catch((err) => {
    console.log(err);
  });
}
