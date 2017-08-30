const MongooseProvider = require('./mongoose-provider.js');

module.exports = {
  set: function(mg) {
    MongooseProvider.set(mg);
  }
};
