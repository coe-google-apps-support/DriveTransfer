const path = require('path');
const G = require('../model/global.js');

exports.view = function(req, res, next) {
  const url = path.resolve(__dirname, '..', '..', 'client', 'src', 'static', 'index');

  G.getUsers().getUser(req.sessionID).then((user) => {
    if (user == null) {
      let customErr = new Error('Your session couldn\'t be found');
      res.status(500).send(customErr);
      console.log(customErr);
      return;
    }

    return user.promise;
  }).then((result) => {
    res.render(url);
  }).catch((err) => {
    console.log(err);
    let customErr = new Error(`Drive Transfer has encountered an error.`);
    res.status(500).send(customErr);
  });

}
