const TransferTask = require('../model/tasks/transfer.js');
const G = require('../model/global.js');

/**
 * Used to transfer all files and sub-files.
 *
 */
exports.transfer = function(req, res, next) {
  var to = req.query.to;
  var id = req.query.id;
  var action = req.query.action;
  var initiator = req.query.initiator;
  var taskID = req.query.taskID;

  if (id === null || id === '' || id === undefined) {
    console.log('bad id');
    res.status(400).send('Request must contain a valid folder id.');
    return;
  }
  if (to === null || to === '' || to === undefined) {
    console.log('bad to');
    res.status(400).send('Request must contain a valid recipient field.');
    return;
  }

  if(action === 'accept' || action === 'reject'){
    G.getUsers().getUser(req.sessionID).then((user) => {
      let tm = G.getTaskManager();
      return tm.authTransferTask(initiator, id, to, req.sessionID, taskID);
    }).then(() => {
      res.status(200).json({
        message: 'Transfer initiated.'
      });
    }).catch((err) => {
      res.status(500).send('Server error.');
      console.log(err);
    });
  }
  else {
    G.getUsers().getUser(req.sessionID).then((user) => {
      return user.promise;
    }).then(() => {
      let tm = G.getTaskManager();
      return tm.addTransferTask(req.sessionID, id, to);
    }).then((taskID) => {
      res.status(200).json({
        message: taskID
      });
    }).catch((err) => {
      res.status(500).send('Server error.');
      console.log(err);
    });
  }

}
