/**
 * Attempts to try a function repeatedly until either success or max number of tries has been reached.
 *
 * @param {Function} toTry The function to try repeatedly. Thrown errors cause a retry.
 * @param {number} max The maximum number of function call attempts.
 * @param {number} delay The base delay in ms. This doubles after every attempt.
 * @return {Promise} Rejects when toTry has failed max times. Resolves if successful once.
 */
function exponentialBackoff(toTry, max, delay) {
  return new Promise((resolve, reject) => {
    try {
      toTry();
      resolve();
    }
    catch (err) {
      if (max > 0) {
        setTimeout(function() {
          exponentialBackoff(toTry, --max, delay * 2).then(() => {
            resolve();
          });
        }, delay);

      } else {
        reject(err);
      }
    }
  });
}

module.exports = exponentialBackoff;
