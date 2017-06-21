/**
 * This file handles a server auth flow. Long term, this isn't the way Drive Transfer will do authorization,
 * but for now, it'll allow for a good working example.
 *
 * @link {https://developers.google.com/drive/v3/web/quickstart/nodejs | nodejs quickstart}
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const readFile = require('../util/promisey-read-file.js').readFile;

const User = require('../model/user.js');
const Users = require('../model/authorized-users.js');
const G = require('../model/global.js');

exports.requireAuth = function(req, res, next) {
  console.log('Setting up user auth.');

  let user = G.getUsers().getUser(req.sessionID);
  if (user && user.authorized) {
    console.log('User is already logged in.');

    // Lets do some MONGO STUUUFF
    let test;
    G.getMongoClient().then((db) => {
      test = db.collection('test');
      return test.insertMany([
        {a: 1},
        {b: 2},
        {c: 3},
      ]);
    }).then((result) => {
      return test.find({'a': 1}).toArray();
      console.log('Successfully added stuff');
    }).then((result) => {
      console.log('found something: ')
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });

    // Lets do some MONGO STUUUFF

    next();
  }
  else {
    console.log('User must log in.');
    const url = path.resolve(__dirname, '..', '..', 'client', 'src', 'static', 'login');
    res.render(url);
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
      res.redirect(req.query.state);
    }
  });
}
