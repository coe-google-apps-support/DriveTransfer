const TransferTask = require('../model/tasks/transfer.js');
const G = require('../model/global.js');

/**
 * Used to transfer all files and sub-files.
 *
 */
exports.transfer = function(req, res, next) {
  var to = req.query.to;
  var id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid folder id.');
    return;
  }
  if (to === null || to === '' || to === undefined) {
    res.status(500).send('Request must contain a valid recipient field.');
    return;
  }

  G.getUsers().getUser(req.sessionID).promise.then(() => {
    let tm = G.getTaskManager();
    return tm.addTransferTask(req.sessionID, id, to);
  }).then((taskID) => {
    res.status(200).json({
      message: taskID
    });
  }).catch((err) => {
    console.log(err);
  });
}
