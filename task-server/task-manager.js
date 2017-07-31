const TaskModel = require('shared/schemas/task.js');
const ListModel = require('shared/schemas/list.js');
const ListTask = require('./tasks/list.js');
const CountTask = require('./tasks/counter.js');

class TaskManager {
  constructor() {
    this.tasks = {};
  }

  async run(taskID) {
    console.log('run')
    if (this.tasks[taskID]) {
      return;
    }

    let task = await TaskModel.findById(taskID)
    if (task.taskType === 'list_task') {
      this.tasks[taskID] = new ListTask(taskID);
    }
    else if (task.taskType === 'count_task') {
      this.tasks[taskID] = new CountTask(taskID);
    }
    else {
      console.log(`Unknown taskType ${task.taskType}`);
      return;
    }

    await this.tasks[taskID].setup();
    
    this.tasks[taskID].run();
  }

  async pause(taskID) {
    console.log('pause')
    if (this.tasks[taskID]) {
      console.log(`Pausing ${taskID}`);
      await this.tasks[taskID].interrupt();
      delete this.tasks[taskID];
    }
  }
}

module.exports = TaskManager;