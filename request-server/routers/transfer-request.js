const TransferRequestProvider = require('shared/providers/transfer-request-provider.js');

/**
 * Used to either accept or reject a transfer.
 *
 */
module.exports = function(req, res, next) {
  var action = req.query.action;
  var taskID = req.query.taskID;

  if (!taskID) {
    res.status(400).send('Request must contain a valid task ID.');
    return;
  }
  if (!action || (action !== 'rejected' && action !== 'accepted')) {
    res.status(400).send('Request must contain a valid action field.');
    return;
  }

  if (action === 'rejected') {
    TransferRequestProvider.rejectTransfer(taskID, req.sessionID).then(() => {
      res.status(200).json({
        message: 'Transfer rejected.'
      });
    }).catch((err) => {
      res.status(500).send('Server error.');
      console.log(err);
    });
  }
  else if (action === 'accepted') {
    TransferRequestProvider.acceptTransfer(taskID, req.sessionID).then(() => {
      res.status(200).json({
        message: 'Transfer accepted.'
      });
    }).catch((err) => {
      res.status(500).send('Server error.');
      console.log(err);
    });
  }
}
