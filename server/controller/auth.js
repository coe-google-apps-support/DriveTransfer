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

// TEMP
var User = require('../model/user.js');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];
//var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
//var TOKEN_PATH = TOKEN_DIR + 'drive-transfer-auth.json';

var clientPromise = null;
var client = null;
var oauthResolve = null;
var oauthReject = null;
var user;

exports.requireAuth = function(req, res, next) {
  console.log('Setting up user auth.');
  // res.status(200).json({
  //   message: 'unimplemented'
  // });
  console.log(user);
  if (user && user.authorized) {
    console.log('User is already logged in.');
    next();
  }
  else if (req.query.code) {
    console.log('User is in the process of logging in.');
    next();
  }
  else {
    console.log('User must log in.');
    user = new User(SCOPES);

    user.promise.then((result) => {
      console.log('USER RESOLVED');
    }, (err) => {
      console.log('USER REJECTED');
    });

    user.createBasicClient().then((result) => {
      var url = user.getURL(req.originalUrl);
      res.redirect(url);
    });
  }
}

exports.oauthCallback = function(req, res, next) {
  console.log('OAUTH');
  console.log(req.query.code);

  if (user == null) {
    console.log('BUSTED');
    throw new Error('That user shouldn\'t be null!');
  }

  user.getToken(req.query.code);

  user.promise.then((result) => {
    if (req.query.state) {
      console.log('STATE HERE');
      console.log(req.query);
      res.redirect(req.query.state);
    }
  });

}

exports.getClient = function() {
  return user.client;
};

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
