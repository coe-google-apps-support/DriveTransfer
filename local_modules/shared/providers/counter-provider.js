const CounterTask = require('../schemas/count.js');
const TaskStates = require('../task-states.js');

class CounterProvider {

  static create(userID) {
    return CounterTask.create({userID}).catch((err) => {
      console.log('Failed creating task.');
      throw err;
    });
  }

  static addResult(taskID, value) {
    return CounterTask.findOne({task: taskID}).then((task) => {
      task.result.push(value);
      return task.save();
    });
  }

}

module.exports = CounterProvider;
