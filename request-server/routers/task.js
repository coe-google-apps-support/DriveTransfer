const TaskProvider = require('shared/providers/task-provider.js');

exports.run = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  TaskProvider.run(taskID).then(() => {
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

  TaskProvider.pause(taskID).then(() => {
    res.status(200).json({
      message: 'Task paused'
    });
  }).catch((err) => {
    console.log(err);
  });
}
