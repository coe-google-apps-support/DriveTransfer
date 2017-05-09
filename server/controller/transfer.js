const Auth = require('./auth.js');
const Google = require('googleapis');
const exponentialBackoff = require('../util/exponential-backoff.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;

exports.list = function(req, res, next) {
  let id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  let client = Auth.getUsers().getUser(req.sessionID).client;

  getItems(client, id).then((result) => {
    console.log('Finished loading.');
    res.status(200).json({
      message: result
    });
  }, (err) => {
    res.status(500).send(err);
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

  applyFunction(client, id, changeOwner, [to]).then((result) => {
    res.status(200).json({
      message: 'nailed it'
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.test = function(req, res, next) {
  var id = req.query.id;
  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  var client = Auth.getUsers().getUser(req.sessionID).client;

  getChildren(client, id).then((result) => {

    res.status(200).json(result);
  }, (err) => {
    res.status(500).send(err);
  });
};

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
  let drive = Google.drive({ version: 'v3', auth: client });
  let files;

  return getChildren(client, id).then((response) => {
    files = response
    return Promise.all(response.files.map((folder) => {
      return getItems(client, folder.id).then((subs) => {
        folder.children = subs.files;
      });
    }));
  }).then(() => {
    return files;
  });
}

function applyFunction(client, id, cb, params) {
  let drive = Google.drive({ version: 'v3', auth: client });
  let folders;

  return getChildren(client, id).then((response) => {
    folders = response.files.filter((file) => {
      return file.mimeType === 'application/vnd.google-apps.folder';
    });

    console.log('Running function on ' + staridtingID);
    return cb(client, id, ...params);
  }).then((response) => {
    return Promise.all(folders.map((folder) => {
      return applyFunction(client, folder.id, cb, params);
    }));
  });
}

function getChildren(client, id) {
  let drive = Google.drive({ version: 'v3', auth: client });

  return exponentialBackoff(() => {
    return new Promise((resolve, reject) => {
      drive.files.list({
        q: '\'' + id + '\' in parents'
      }, function(err, response) {
        if (err != null) {
          reject(err);
          return;
        }

        resolve(response);
      });
    });
  }, MAX_TRIES, NAPTIME);
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
  let drive = Google.drive({ version: 'v3', auth: client });

  return exponentialBackoff(() => {
    return new Promise((resolve, reject) => {
      drive.permissions.create({
        fileId: id,
        transferOwnership: true,
        resource: {
          emailAddress: to,
          role: 'owner',
          type: 'user'
        }
      }, function(err, response) {
        if (err != null) {
          reject(err);
          return;
        }

        resolve(response);
      });
    });
  }, MAX_TRIES, NAPTIME);
}
