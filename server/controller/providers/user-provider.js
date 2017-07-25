const mongoose = require('mongoose');
const User = require('../../model/schemas/user.js');
const Config = require('../../config.js');

class UserProvider {

  /**
   * TODO readFile at the start of server run
   * TODO add token refreshing to task server
   *
   */

  /**
   * Gets a user.
   * @param {string} id The ID of the user to find.
   * @return {Promise} A Promise resolved with the value of the user.
   */
  static getUser(id) {
    // TODO Check if the token needs refreshing here?
    return User.findOne({sessionID: id}).then((user) => {
      if (user) {
        return user;
      }

      return User.create({
        sessionID: id,
        scopes: Config.OAuth.SCOPES,
      });
    });
  }

  /**
   * Gets the url for a given user
   * TODO don't have a func for this.
   */
  static getAuthURL(originalURL) {

  }

  /**
   * Gets tokens for the code provided by the OAuth flow.
   * @param {string} id The id of the user to get tokens for.
   * @param {string} code A temporary code that can be used to get tokens.
   * @return {Promise} A Promise resolved with the user.
   */
  static giveCode(id, code) {
    return User.findOne({sessionID: id}).then((user) => {
      // Do stuff with the user.
      return user.client.getToken(code, (err, tokens) => {
        if (err) {
          return Promise.reject(err);
        }

        user.tokens = tokens;
        return user.save();
      });
    }).catch((err) => {
      console.log(`Token retrieval failed for user ${id}.`);
    });
  }
}

module.exports = UserProvider;
