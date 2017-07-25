/**
 * This file handles a server auth flow. Long term, this isn't the way Drive Transfer will do authorization,
 * but for now, it'll allow for a good working example.
 *
 * @link {https://developers.google.com/drive/v3/web/quickstart/nodejs | nodejs quickstart}
 */

const path = require('path');
const UserProvider = require('../controller/providers/user-provider.js');

exports.requireAuth = function(req, res, next) {
  console.log('Setting up user auth.');

  UserProvider.getUser(req.sessionID).then((user) => {
    if (user.isAuthorized) {
      console.log('User is already logged in.');
      next();
    }
    else {
      console.log('User must log in.');
      const url = path.resolve(__dirname, '..', '..', 'client', 'src', 'static', 'login');
      res.render(url);
    }
  });
}

exports.oauthCallback = function(req, res, next) {
  console.log('OAUTH for ' + req.sessionID);

  UserProvider.giveCode(req.sessionID, req.query.code).then(() => {
    console.log('redirecting to ' + req.query.state);
    res.redirect(req.query.state);
  }).catch((err) => {
    // TODO error page
    res.status(500).send(err);
    console.log(err);
    return;
  });
}
