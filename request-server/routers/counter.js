const CounterProvider = require('shared/providers/counter-provider.js');

/**
 * Used to count. It's a simple test.
 *
 */
exports.count = function(req, res, next) {
  return CounterProvider.create(req.sessionID).then((counterTask) => {
    console.log(`Task is ${counterTask.task}.`);
    res.status(200).json({
      message: counterTask.task
    });
  }).catch((err) => {
    console.log(err);
  });
}
