const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;
const Config = require('../config.js');
const OAuth2 = require('googleapis').auth.OAuth2;

const schema = new Schema({
  sessionID: {
    type: String,
    ref: 'sessions',
    required: true,
  },
  emailAddress: {
    type: String,
  },
  scopes: {
    type: [String],
    required: true,
  },
  tokens: {
    access_token: String,
    token_type: String,
    expiry_date: Number,
    refresh_token: String,
  }
});

schema
.virtual('isAuthorized')
.get(function() {
  return this.tokens && this.tokens.access_token ? true : false;
});

schema
.virtual('client')
.get(function() {
  let client = new OAuth2(Config.OAuth.CLIENT_ID, Config.OAuth.CLIENT_SECRET, Config.OAuth.REDIRECT_URL);

  if (this.isAuthorized) {
    client.setCredentials(this.tokens);
  }
  return client;
});

module.exports = mongoose.model('user', schema);
