const TransferProvider = require('shared/providers/transfer-provider.js');

/**
 * Used to transfer all files and sub-files.
 *
 */
exports.transfer = function(req, res, next) {
  var to = req.query.to;
  var id = req.query.id;

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

exports.getSubstate = function(req, res, next) {
  var id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    console.log('bad id');
    res.status(400).send('Request must contain a valid folder id.');
    return;
  }

  TransferProvider.getSubstate(id).then((state) => {
    res.status(200).json({
      message: state
    });
  }).catch((err) => {
    res.status(500).send('Server error.');
    console.log(err);
  });

}
