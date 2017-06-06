const path = require('path');
const AuthAPI = require('../controller/auth.js');

exports.view = function(req, res, next) {
  let data = {
    clientID: '"test id"',
    token: '"test token"',
    key: '"test key"',
  };
  const url = path.resolve(__dirname, '..', '..', 'client', 'src', 'static', 'index');

  const user = AuthAPI.getUsers().getUser(req.sessionID);
  if (user == null) {
    let err = new Error('Your session couldn\'t be found');
    res.status(500).send(err);
    console.log(err);
    return;
  }

  user.promise.then((result) => {
    data.client = JSON.stringify(result);
    res.render(url, data);
  });
}
