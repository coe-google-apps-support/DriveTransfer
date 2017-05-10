const http = require('http');

module.get = function(address) {
  return new Promise((resolve, reject) => {
    http.get(address, (result) => {
      const { statusCode } = result;

      if (statusCode !== 200) {
        reject(new Error(`Request failed: ${statusCode}`));
      }
      else {
        resolve(result);
      }
    });
  });
}
