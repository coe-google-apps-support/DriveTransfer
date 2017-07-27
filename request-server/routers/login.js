const UserProvider = require('shared/providers/user-provider.js');

exports.login = function(req, res, next) {
  UserProvider.getUser(req.sessionID).then((user) => {
    if (user.isAuthorized) {
      console.log('Skipping login.');
      next();
    }
    else {
      console.log('Should probs log in.');
      let url = user.client.generateAuthUrl({
        access_type: 'offline',
        scope: user.scopes,
        state: req.headers.referer,
        prompt: 'consent',
      });

      res.redirect(url);
    }
  }).catch((err) => {console.log('login be busted')});
}
