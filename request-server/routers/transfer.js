const TransferProvider = require('shared/providers/transfer-provider.js');

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


  if (action) {
    if (!taskID) {
      res.status(400).send('Request must contain a valid task id.');
      return;
    }

    if(action === 'accept'){
      TransferProvider.acceptTransfer(taskID).then(() => {
        res.status(200).json({
          message: 'Transfer accepted.'
        });
      }).catch((err) => {
        // TODO error page
        res.status(500).send('Server error.');
        console.log(err);
      });
    }
    else if (action === 'reject') {
      TransferProvider.rejectTransfer(taskID).then(() => {
        res.status(200).json({
          message: 'Transfer rejected.'
        });
      }).catch((err) => {
        // TODO error page
        res.status(500).send('Server error.');
        console.log(err);
      });
    }
  }
  else {
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

    TransferProvider.create(req.sessionID, id, to).then((transferTask) => {
      res.status(200).json({
        message: transferTask.task
      });
    }).catch((err) => {
      res.status(500).send('Server error.');
      console.log(err);
    });
  }

}
