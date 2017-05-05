var Auth = require('./auth.js');
var Google = require('googleapis');

exports.list = function(req, res, next) {
  var id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  var client = Auth.getUsers().getUser(req.sessionID).client;

  getItems(client, id).then((result) => {
    res.status(200).json({
      message: result
    });
  }, (err) => {
    console.log(err);
  });
}

exports.transfer = function(req, res, next) {
  var to = req.query.to;
  var id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }
  if (to === null || to === '' || to === undefined) {
    res.status(500).send('Request must contain a valid to field.');
    return;
  }

  var client = Auth.getUsers().getUser(req.sessionID).client;

  changeOwner(client, id, to).then((result) => {

    res.status(200).json({
      message: result
    });
  }, (err) => {
    console.log(err);
  });
}

/**
 * This function recursively moves through a Google Drive given an authenticated client and a folder id.
 * Limitations:
 * - Drive folders can appear in multiple places. This can mean you visit the same sub-folder structures multiple times.
 * - I've been trying to determine if you can have a loop in a Google Drive folder structure. It seems you can't, but if
 * you could, this function would get stuck in an infinite loop.
 * http://stackoverflow.com/questions/43793895/is-it-possible-for-google-drives-folder-structure-to-contain-a-loop
 *
 * @param {Google.auth.OAuth2} client An authenticated client capable of making requests.
 * @param {string} id The id of a Google Drive folder.
 * @return {Promise} A Promise that has a JSON object as the result.
 */
function getItems(client, id) {
  var drive = Google.drive({ version: 'v3', auth: client });

  return new Promise((resolve, reject) => {
    drive.files.list({
      q: '\'' + id + '\' in parents'
    }, function(err, response) {
      if (err) {
        reject(err);
        return;
      }

      let folders = response.files.filter((file) => {
        return file.mimeType === 'application/vnd.google-apps.folder';
      });

      Promise.all(folders.map((folder) => {
        return getItems(client, folder.id).then((subs) => {
          folder.children = subs.files;
        });
      })).then((result) => {
        resolve(response);
      });
    });
  })
}

/**
 * This function changes the owner of a Google Drive file.
 *
 * @param {Google.auth.OAuth2} client An authenticated client capable of making requests.
 * @param {string} id The id of a Google Drive file or folder.
 * @param {string} to The user to receive ownership.
 * @return {Promise} A Promise that has a JSON object as the result.
 */
function changeOwner(client, id, to) {
  var drive = Google.drive({ version: 'v3', auth: client });

  return new Promise((resolve, reject) => {
    drive.permissions.create({
      fileId: id,
      transferOwnership: true,
      resource: {
        emailAddress: to,
        role: 'owner',
        type: 'user'
      }
    }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(response);
    });
  });
}
