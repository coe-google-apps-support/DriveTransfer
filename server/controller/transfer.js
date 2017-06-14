const Auth = require('./auth.js');
const G = require('../model/global.js');
const Google = require('googleapis');
const exponentialBackoff = require('../util/exponential-backoff.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;

/**
 * Used to list all files and sub-files.
 *
 */
exports.list = function(req, res, next) {
  let id = req.query.id;

  if (id === null || id === '' || id === undefined) {
    res.status(500).send('Request must contain a valid id.');
    return;
  }

  let client = G.getUsers().getUser(req.sessionID).client;

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

/**
 * Used to transfer all files and sub-files.
 *
 */
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

  var client = G.getUsers().getUser(req.sessionID).client;

  applyFunction(client, id, changeOwner, [to]).then((result) => {
    res.status(200).json({
      message: result
    });
  }, (err) => {
    console.log(err);
    res.status(500).send(err);
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

/**
 * Applies a function to every descendant starting at the file given by id. Failures are reattempted multiple times.
 *
 * @param {Google.auth.OAuth2} client An authenticated client capable of making requests.
 * @param {string} id The id of a Google Drive folder.
 * @param {Function} cb A function that returns a Promise. This callback is passed (client, id, param1, param2 ...).
 * @param {Array<Object>} params Additional params to be passed to cb.
 * @return {Promise} A Promise that has a JSON object as the result.
 */
function applyFunction(client, id, cb, params) {
  let drive = Google.drive({ version: 'v3', auth: client });
  let responses = [];

  console.log('Running function on ' + id);
  return cb(client, id, ...params).then((response) => {
    response.fileID = id;
    responses.push(response);
    return getChildren(client, id);
  }).then((response) => {
    return Promise.all(response.files.map((folder) => {
      return applyFunction(client, folder.id, cb, params);
    })).then((newResponses) => {
      responses.push(...newResponses);
    });
  }).then(() => {
    return responses;
  });
}

/**
 * Gets the children of the file denoted by id.
 *
 * @param {Google.auth.OAuth2} client An authenticated client capable of making requests.
 * @param {string} id The id of a Google Drive file or folder.
 * @return {Promise} Contains the results of the query.
 */
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
 * TODO Currently, every transfer results in an email AND in a new link to the file
 * being placed at the root of the users Drive.
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

exports.getChildren = getChildren;
exports.changeOwner = changeOwner;
exports.applyFunction = applyFunction;
exports.getItems = getItems;
