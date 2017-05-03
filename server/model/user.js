var readFile = require('../util/promisey-read-file.js').readFile;
var OAuth2 = require('googleapis').auth.OAuth2;

class User {
  constructor(scopes, id) {
    console.log('Building user.');

    this.id = id;
    this.scopes = scopes;
    this.client = null;
    this.clientState = 'unset';
    this.authorized = false;

    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  authorize(res, req, next) {
    console.log('AUTHORIZING USER');
  }

  /************** Authorization steps **************/
  // https://github.com/google/google-api-nodejs-client/#oauth2-client

  // Create the basic client.

  createBasicClient() {
    return readFile('../client_secret.json').then(
      (result) => {
        let credentials = JSON.parse(result);
        let clientSecret = credentials.web.client_secret;
        let clientId = credentials.web.client_id;
        let redirectUrl = credentials.web.redirect_uris[0];

        this.client = new OAuth2(clientId, clientSecret, redirectUrl);
        this.clientState = 'basic';
        return this.client;
    }).catch(
      (err) => {
        console.log('Error loading client secret file: ' + err);
        throw err;
    });
  }

  // Redirect to the returned URL to receive user consent.

  getURL(redirect) {
    let url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: redirect
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
        //storeToken(tokens);
        this._resolve(this.client);
      }
      else {
        console.log('Token retrieval failed: ' + err);
        this._reject(err);
      }
    });
  }
}

module.exports = User;
