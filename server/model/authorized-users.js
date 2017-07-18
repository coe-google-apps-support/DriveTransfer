const mongoose = require('mongoose');
const MongooseUser = mongoose.model('MongooseUser');
const User = require('./user.js');

class AuthorizedUsers {

  constructor() {
    console.log('Building user base.');
    this.users = {};
  }

  getUser(key) {
    // First look locally.
    if (this.users[key] != null) {
      return Promise.resolve(this.users[key]);
    }

    //Then check the db.
    return MongooseUser.findOne({id: key}).then((mUser) => {
      if (mUser == null) {
        console.log(`User ${key} not found.`);
        return null;
      }

      this.users[key] = User.fromDB(mUser);
      return this.users[key];
    });
  }

  addUser(user) {
    this.users[user.id] = user;
  }

  refreshTokens(expiringWithin) {
    Object.keys(this.users).forEach((key) => {
      this.getUser(key).then((user) => {
        let expiresIn = user.mongooseUser.tokens.expiry_date - new Date();
        if (expiresIn < expiringWithin) {
          user.refreshToken();
          user.sendToken();
        }
      });
    });
  }
}

module.exports = AuthorizedUsers;
