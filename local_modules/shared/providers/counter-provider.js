const CounterTask = require('../schemas/count.js');
const CounterResult = require('../schemas/count_result.js');
const TaskStates = require('../task-states.js');
const ObjectId = require('../mongoose-provider.js').get().Types.ObjectId;

class CounterProvider {

  static create(userID) {
    return CounterTask.create({userID}).catch((err) => {
      console.log('Failed creating task.');
      throw err;
    });
  }

  static addResult(taskID, value) {
    return CounterResult.create({task: taskID, value}).catch((err) => {
      console.log(`Failed adding result for ${taskID}.`);
    })
  }

  static getGreatestResult(taskID) {
    return CounterResult.findOne({task: new ObjectId(taskID)})
      .sort('-value')
      .exec()
      .then((result) => {
        if (!result) return 0;
        return result.value;
      });
  }

}

module.exports = CounterProvider;
