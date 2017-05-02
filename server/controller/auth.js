/**
 * This file handles a server auth flow. Long term, this isn't the way Drive Transfer will do authorization,
 * but for now, it'll allow for a good working example.
 *
 * @link {https://developers.google.com/drive/v3/web/quickstart/nodejs | nodejs quickstart}
 */

var fs = require('fs');
var readline = require('readline');
var Google = require('googleapis');
var OAuth2 = Google.auth.OAuth2;
var readFile = require('../util/promisey-read-file.js').readFile;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-transfer-auth.json';

var clientPromise = null;
var client = null;
var oauthResolve = null;
var oauthReject = null;

exports.auth = function(req, res, next) {
  res.status(200).json({
    message: 'unimplemented'
  });
}

exports.oauthCallback = function(req, res, next) {
  console.log('OAUTH');
  console.log(req.query.code);

  if (clientPromise === null || client === null) {
    throw new Error('Callback occurred with no requesting client.');
  }

  client.getToken(req.query.code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      client.setCredentials(tokens);
      storeToken(tokens);
      oauthResolve(client);
    }
    else {
      console.log('Token retrieval failed: ' + err);
      oauthReject(err);
    }
  });
}

exports.getAuthorizedClient = function(req, res, next) {
  console.log('I WANT AUTH!!');
  console.log(req.originalUrl);
  if (clientPromise === null) {
    clientPromise = new Promise(function(resolve, reject) {
      oauthResolve = resolve;
      oauthReject = reject;
    });

    readFile('../client_secret.json').then(
      function(result) {
        var credentials = JSON.parse(result);
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        var redirectUrl = credentials.web.redirect_uris[0];
        // var redirectUrl = 'http://localhost:3000/api/auth/oauth';

        client = new OAuth2(clientId, clientSecret, redirectUrl);
        return client;
    }).catch(
      function(err) {
        console.log('Error loading client secret file: ' + err);
    }).then(function(oauthClient) {
      var url = oauthClient.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: req.originalUrl
      });
      console.log(url);
      res.redirect(url);
    });
  }

  return clientPromise;
}

exports.getClient = function() {
  return client;
};

/**
 * Provides a Promise wrapper around Googles code for token exchanger.
 *
 * @param {googleAuth.OAuth2} client The oauth client to use for the exchange.
 * @param {string} code The code to be exchanged. Usually something like 4/afsd6hf743jf8ajfsd554sdq.
 * @return {Promise} A Promise that has the tokens and the response Object as params.
 */
function getToken(client, code) {
  return new Promise(function(resolve, reject) {
    client.getToken(code, function(err, tokens, response) {
      if (err) {
        reject(err);
      }
      else {
        resolve(tokens, response);
      }
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
