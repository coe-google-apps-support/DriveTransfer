const readFile = require('../util/promisey-read-file.js').readFile;
const OAuth2 = require('googleapis').auth.OAuth2;
const MongooseUser = require('./schemas/user.js');

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
      user.client.setCredentials(mongooseUser.tokens);
      user.authorized = true;
      user._resolve(user.client);
      return user;
    }).then((thisUser) => {
      return user.refreshToken();
    }).then(() => {
      return user;
    });
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

  refreshToken() {
    return new Promise((resolve, reject) => {
      this.client.refreshAccessToken((err, tokens) => {
        if (err) {
          reject(err);
        }
        else {
          this.mongooseUser.tokens = tokens;
          MongooseUser.findOneAndUpdate({id: this.id}, this.mongooseUser).then(() => {
            resolve(tokens);
          }).catch((err) => {
            console.log(`Failed updating user ${this.id}`);
          });
        }
      });
    })
  }

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
