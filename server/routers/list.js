const List = require('../model/tasks/list.js');
const G = require('../model/global.js');
const ListProvider = require('../controller/providers/list-provider.js');

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

  G.getUsers().getUser(req.sessionID).then((user) => {
    return user.promise;
  }).then(() => {
    return ListProvider.create(req.sessionID, id)
  }).then((listTask) => {
    console.log(`Task is ${listTask.task}.`);
    res.status(200).json({
      message: listTask.task
    });
  }).catch((err) => {
    console.log(err);
  });
}
