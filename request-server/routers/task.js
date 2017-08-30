const TaskProvider = require('shared/providers/task-provider.js');

exports.run = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  TaskProvider.run(taskID).catch((err) => {
    res.status(500).send('Error when trying to run task.');
    return;
  }).then(() => {
    res.status(200).json({
      message: 'Task run'
    });
  });
}

exports.cancel = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  TaskProvider.cancel(taskID).catch((err) => {
    res.status(500).send('Error when trying to cancel task.');
    return;
  }).then(() => {
    res.status(200).json({
      message: 'Task cancelled'
    });
  });
}
