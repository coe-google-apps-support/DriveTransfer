var Auth = require('./auth.js');

exports.redirect = function(req, res, next) {
  var queryString = req.query;

  console.log(queryString);

  if (queryString.code) {
    Auth.oauthCallback(req, res, next);
  }

  if (queryString.state) {
    console.log ('we got some state here!');
    res.redirect(queryString.state);
  }
}
