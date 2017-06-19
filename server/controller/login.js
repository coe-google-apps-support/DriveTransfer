const G = require('../model/global.js');
const User = require('../model/user.js');

const SCOPES = [
  'https://www.googleapis.com/auth/drive'
];

exports.login = function(req, res, next) {
  let user = G.getUsers().getUser(req.sessionID);
  if (user && user.authorized) {
    console.log('User is already logged in.');
    next();
  }
  else {
    console.log('User must log in.');
    let us = G.getUsers();
    user = new User(SCOPES, req.sessionID);
    us.addUser(user);

    user.createBasicClient().then((result) => {
      let referer = req.headers.referer;
      let url = user.getURL(referer);
      res.redirect(url);
    });
  }
}
