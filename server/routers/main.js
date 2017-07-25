const path = require('path');
const UserProvider = require('../controller/providers/user-provider.js');

exports.view = function(req, res, next) {
  const url = path.resolve(__dirname, '..', '..', 'client', 'src', 'static', 'index');
  res.render(url);
}
