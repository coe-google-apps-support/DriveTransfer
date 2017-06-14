/**
 * This file handles a server auth flow. Long term, this isn't the way Drive Transfer will do authorization,
 * but for now, it'll allow for a good working example.
 *
 * @link {https://developers.google.com/drive/v3/web/quickstart/nodejs | nodejs quickstart}
 */

const fs = require('fs');
const readline = require('readline');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const readFile = require('../util/promisey-read-file.js').readFile;

const User = require('../model/user.js');
const Users = require('../model/authorized-users.js');
const G = require('../model/global.js');

const SCOPES = [
  'https://www.googleapis.com/auth/drive'
];
//var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
//var TOKEN_PATH = TOKEN_DIR + 'drive-transfer-auth.json';

var clientPromise = null;
var client = null;
var oauthResolve = null;
var oauthReject = null;
var users;

exports.requireAuth = function(req, res, next) {
  console.log('Setting up user auth.');


  let user = G.getUsers().getUser(req.sessionID);
  if (user && user.authorized) {
    console.log('User is already logged in.');
    next();
  }
  else if (req.query.code) { // TODO
    console.log('User is in the process of logging in.');
    next();
  }
  else {
    console.log('User must log in.');
    let us = G.getUsers();
    user = new User(SCOPES, req.sessionID);
    us.addUser(user);

    user.promise.then((result) => {
      console.log('USER RESOLVED');
    }, (err) => {
      console.log('USER REJECTED');
    });

    user.createBasicClient().then((result) => {
      let url = user.getURL(req.originalUrl);
      res.redirect(url);
    });
  }
}

exports.oauthCallback = function(req, res, next) {
  console.log('OAUTH for ' + req.sessionID);

  let user = G.getUsers().getUser(req.sessionID);
  if (user == null) {
    let err = new Error('Your session couldn\'t be found');
    res.status(500).send(err);
    console.log(err);
    return;
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
