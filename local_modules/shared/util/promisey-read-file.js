var fs = require('fs');

/**
 * Wraps node.js readFile in a Promise interface. Reads utf-8.
 * @param {string} fileName The path to the file.
 * @return {Promise} A Promise that is resolved with value of the file.
 */
exports.readFile = function(fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, 'utf-8', function(err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}
