var Auth = require('./auth.js');

exports.redirect = function(req, res, next) {
  if (req.query.code !== null && req.query.code !== undefined) {
    Auth.oauthCallback(req, res, next);
  }
  else {
    res.status(500).send('Unknown redirect.');
  }
}
