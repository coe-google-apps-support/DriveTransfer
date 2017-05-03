var Auth = require('./auth.js');
var Google = require('googleapis');

exports.helloworld = function(req, res, next) {

  Auth.getAuthorizedClient(req, res, next).then(function(client) {
    console.log(client);
  });
}

exports.list = function(req, res, next) {
  var client = Auth.getUsers().getUser(req.sessionID).client;
  console.log(client);
  var drive = Google.drive({ version: 'v3', auth: client });
  drive.files.list({
    spaces: 'drive',
    pageSize: 10
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    res.status(200).json({
      message: response
    })
  });
}
