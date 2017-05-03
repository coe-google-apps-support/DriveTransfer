class AuthorizedUsers {

  constructor() {
    console.log('Building user base.');
    this.users = {};
  }

  getUser(key) {
    return this.users[key];
  }

  addUser(user) {
    this.users[user.id] = user;
  }
}

module.exports = AuthorizedUsers;
