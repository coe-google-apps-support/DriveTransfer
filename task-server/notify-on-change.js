const MongoOplog = require('mongo-oplog-filter');
const Config = require('shared/config.js');

/**
 * Watches the oplog for a single change. After resolving, the watcher is destroyed.
 * @param {string} collection the collection name to watch for changes.
 * @param {Function} filter A Function that receives a document from the oplog and
 * returns true when it wants the Promsie to be resolved.
 * @return {Promise} A Promise that is resolved when the filter returns true.
 */
function onChange(collection, filter) {
  const oplog = MongoOplog(Config.Database.OP_LOG_URL);
  const filterOP = oplog.filter(`${Config.Database.OP_LOG_DB}.${collection}`, filter);

  oplog.tail();

  let promise = new Promise((resolve, reject) => {
    filterOP.on('update', (doc) => {
      promise.destroyOPLog();
      resolve(doc);
    });
  });

  promise.destroyOPLog = () => {
    oplog.destroy();
  };

  return promise;
};

module.exports = onChange;
