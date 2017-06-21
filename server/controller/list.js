const List = require('../model/tasks/list.js');
const G = require('../model/global.js');

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

  G.getUsers().getUser(req.sessionID).promise.then(() => {
    let tm = G.getTaskManager();
    return tm.addListTask(req.sessionID, id);
  }).then((taskID) => {
    res.status(200).json({
      message: taskID
    });
  }).catch((err) => {
    console.log(err);
  });
}
