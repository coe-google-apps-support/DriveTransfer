const G = require('./model/global.js');

const REFRESH_TOKENS_EVERY = 15 * 60 * 1000; // 25 minutes

module.exports = function() {
  let users = G.getUsers();
  let func = users.refreshTokens.bind(users, REFRESH_TOKENS_EVERY * 2);
  this.setInterval(func, REFRESH_TOKENS_EVERY);
}
