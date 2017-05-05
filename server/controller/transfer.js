var Auth = require('./auth.js');
var Google = require('googleapis');

exports.list = function(req, res, next) {
  var client = Auth.getUsers().getUser(req.sessionID).client;

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

exports.transfer = function(req, res, next) {
  var to = req.query.to;
  var id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  var client = Auth.getUsers().getUser(req.sessionID).client;
  var drive = Google.drive({ version: 'v3', auth: client });

  getItems(client, id).then((result) => {
    console.log('Served');
    res.status(200).json({
      message: result
    })
  }, (err) => {
    console.log(err);
  });
}

function getItems(client, id) {
  var drive = Google.drive({ version: 'v3', auth: client });
  console.log('getting items for: ' + id);
  return new Promise((resolve, reject) => {
    drive.files.list({
      maxResults: 5,
      q: '\'' + id + '\' in parents'
    }, function(err, response) {
      if (err) {
        reject(err);
      }

      let folders = response.files.filter((file) => {
        return file.mimeType === 'application/vnd.google-apps.folder';
      });

      Promise.all(folders.map((folder) => {
        return getItems(client, folder.id).then((subs) => {
          console.log('Adding subs for ' + folder.id);
          folder.children = subs.files;
        });
      })).then((result) => {
        console.log('done');
        resolve(response);
      });
    });
  })
}
