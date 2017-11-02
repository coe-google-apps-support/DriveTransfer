const path = require('path');
const UserProvider = require('shared/providers/user-provider.js');
const Config = require('shared/config.js');

exports.view = function(req, res, next) {
  res.render('index', {
    constants: {
      DT_SOCKET_URL: Config.Web.WEBSOCKET_URL
    }
  });
}
