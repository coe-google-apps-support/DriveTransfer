const MongoOplog = require('mongo-oplog-filter');
const Config = require('shared/config.js');

/**
 * Watches the oplog for a single
 */
function onChange(collection, filter) {
  const oplog = MongoOplog(Config.Database.OP_LOG_URL);
  const filterOP = oplog.filter(`${Config.Database.OP_LOG_DB}.${collection}`, filter);

  oplog.tail();

  return new Promise((resolve, reject) => {
    filterOP.on('update', (doc) => {
      oplog.destroy();
      resolve(doc);
    });
  })
};

module.exports = onChange;
