function exponentialBackoff(toTry, max, delay) {
  console.log('max', max, 'next delay', delay);

  return new Promise((resolve, reject) => {
    try {
      toTry();
      resolve();
    }
    catch (err) {
      if (max > 0) {
        setTimeout(function() {
          exponentialBackoff(toTry, --max, delay * 2, callback).then(() => {
            resolve();
          });
        }, delay);

      } else {
        reject(new Error('This is reeeeally screwed.'));
      }
    }
  })


}

module.exports = exponentialBackoff;
