const ListProvider = require('shared/providers/list-provider.js');

/**
 * Used to list all files and sub-files.
 *
 */
exports.list = function(req, res, next) {
  let id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  return ListProvider.create(req.sessionID, id).then((listTask) => {
    console.log(`Task is ${listTask.task}.`);
    res.status(200).json({
      message: listTask.task
    });
  }).catch((err) => {
    console.log(err);
  });
}
