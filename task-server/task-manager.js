const TaskModel = require('shared/schemas/task.js');
const ListModel = require('shared/schemas/list.js');
const ListTask = require('./tasks/list.js');
const CountTask = require('./tasks/counter.js');
const TransferTask = require('./tasks/transfer.js');
const TransferRequestTask = require('./tasks/transfer-request.js');
const TransferFilterTask = require('./tasks/transfer-filter.js');

class TaskManager {
  constructor() {
    this.tasks = {};
  }

  async run(taskID) {
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
    else if (task.taskType === 'transfer_task') {
      this.tasks[taskID] = new TransferTask(taskID);
    }
    else if (task.taskType === 'transfer_request_task') {
      this.tasks[taskID] = new TransferRequestTask(taskID);
    }
    else if (task.taskType === 'transfer_filter_task') {
      this.tasks[taskID] = new TransferFilterTask(taskID);
    }
    else {
      console.log(`Unknown taskType ${task.taskType}`);
      return;
    }

    await this.tasks[taskID].setup();

    this.tasks[taskID].run();
  }

  async pause(taskID) {
    if (this.tasks[taskID]) {
      console.log(`Pausing ${taskID}`);
      await this.tasks[taskID].interrupt();
      delete this.tasks[taskID];
    }
  }
}

module.exports = TaskManager;
