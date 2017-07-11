const G = require('../model/global.js');
const User = require('../model/user.js');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
];

exports.login = function(req, res, next) {
  let users = G.getUsers();

  users.getUser(req.sessionID).then((user) => {
    if (user && user.authorized) {
      console.log('User is already logged in.');
      next();
    }
    else {
      console.log('User must log in.');
      user = new User(SCOPES, req.sessionID);
      users.addUser(user);

      return user.createBasicClient().then((user) => {
        let referer = req.headers.referer;
        let url = user.getURL(referer);
        res.redirect(url);
      });
    }
  }).catch((err) => {
    console.log(err);
  });
}
