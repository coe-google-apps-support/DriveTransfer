const retryCodes = [403, 429];

/**
 * Attempts to try a function repeatedly until either success or max number of tries has been reached.
 *
 * @param {Function} toTry The function to try repeatedly. Thrown errors cause a retry. This function returns a Promise.
 * @param {number} max The maximum number of function retries.
 * @param {number} delay The base delay in ms. This doubles after every attempt.
 * @return {Promise} Rejects when toTry has failed max times. Resolves if successful once.
 */
function exponentialBackoff(toTry, max, delay) {

  return toTry().catch((err) => {
    if (max <= 0) {
      console.log('Too many failures.');
      return Promise.reject(err);
    }

    // We only want to use retry certain codes
    if (!retryCodes.includes(err.code)) {
      return Promise.reject(err);
    }

    // This delays the Promise by delay.
    return new Promise((resolve) => setTimeout(resolve, delay))
      .then(() => {
        return exponentialBackoff(toTry, --max, delay * 2);
      });

    });
}

module.exports = exponentialBackoff;
