const G = './global.js';

class AuthorizedUsers {

  constructor() {
    console.log('Building user base.');
    this.users = {};
  }

  reloadUsers() {
    let collectionl
    G.getMongoClient().then((db) => {
      collection = db.collection('users');

      return collection.find({}).toArray();
    }).then((result) => {
      console.log(result);
    });
  }

  getUser(key) {
    return this.users[key];
  }

  addUser(user) {
    this.users[user.id] = user;
  }
}

module.exports = AuthorizedUsers;
