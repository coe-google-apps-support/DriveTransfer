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

exports.cancel = function(req, res, next) {
  let taskID = req.query.taskID;

  if (taskID === null || taskID === '' || taskID === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  TaskProvider.cancel(taskID).then(() => {
    res.status(200).json({
      message: 'Task cancelled'
    });
  }).catch((err) => {
    console.log(err);
  });
}
