const readFile = require('../util/promisey-read-file.js').readFile;
const OAuth2 = require('googleapis').auth.OAuth2;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  scopes: {
    type: [String],
    required: true,
  },
  tokens: {
    access_token: {
      type: String,
      required: true,
    },
    token_type: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: Number,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    }
  }
});

let MongooseUser = mongoose.model('MongooseUser', UserSchema);

class User {
  constructor(scopes, id) {
    console.log('Building user.');

    this.id = id;
    this.scopes = scopes;
    this.client = null;
    this.clientState = 'unset';
    this.authorized = false;
    this.mongooseUser = null;
    this.socket = null;

    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  static fromDB(mongooseUser) {
    let user = new User(mongooseUser.scopes, mongooseUser.id);
    user.mongooseUser = mongooseUser;

    return user.createBasicClient().then((thisUser) => {
      thisUser.client.setCredentials(mongooseUser.tokens);
      thisUser.authorized = true;
      thisUser._resolve(thisUser.client);
      return thisUser;
    })
  }

  setSocket(socket) {
    this.socket = socket;
  }

  sendToken() {
    if (this.socket) {
      this.socket.send(JSON.stringify({
        accessToken: this.mongooseUser.tokens.access_token
      }));
    }
  }

  /************** Authorization steps **************/
  // https://github.com/google/google-api-nodejs-client/#oauth2-client

  // Create the basic client.

  createBasicClient() {
    return readFile('../client_secret.json').then((result) => {
      let credentials = JSON.parse(result);
      let clientSecret = credentials.web.client_secret;
      let clientId = credentials.web.client_id;
      let redirectUrl = credentials.web.redirect_uris[0];

      this.client = new OAuth2(clientId, clientSecret, redirectUrl);
      this.clientState = 'basic';
      return this;
    }).catch((err) => {
      console.log('Error loading client secret file: ' + err);
      throw err;
    });
  }

  // Redirect to the returned URL to receive user consent.

  getURL(redirect) {
    let url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: redirect,
      prompt: 'consent',
    });

    return url;
  }

  acquireConsent(req, res, next) {
    let url = this.getURL();
    res.redirect(url);
  }

  // Receive the callback containing the code.

  // Swap the code for a token. Done!
  getToken(code) {
    this.client.getToken(code, (err, tokens) => {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (!err) {
        console.log('credentials set');
        this.client.setCredentials(tokens);
        this.authorized = true;

        this.mongooseUser = new MongooseUser({
          id: this.id,
          scopes: this.scopes,
          tokens: tokens,
        });

        this.mongooseUser.save().then((result) => {
          this._resolve(this.client);
        }).catch((err) => {
          console.log(`Failed saving user ${this.id} to the database.`);
          console.log(err);
        });
      }
      else {
        console.log('Token retrieval failed: ' + err);
        this._reject(err);
      }
    });
  }
}

module.exports = User;
