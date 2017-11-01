const path = require('path');
const UserProvider = require('shared/providers/user-provider.js');

exports.view = function(req, res, next) {
  res.render('index');
}
