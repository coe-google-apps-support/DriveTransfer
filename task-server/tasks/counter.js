const Task = require('./task.js');
const CountProvider = require('shared/providers/counter-provider.js');

class Counter extends Task {

  constructor(taskID) {
    super(taskID);
    this.fileNumber = 0;
    this.taskID = taskID;

    let promise = new Promise((resolve, reject) => {
      this.doneRunning = resolve;
    })
  }

  async run() {
    this.run = true;

    while (this.run) {
      await this.doWork();

      await CountProvider.addResult(this.taskID, this.fileNumber);

      await new Promise((resolve, reject) => {
        setTimeout(() => {resolve()}, 1000);
      });
    }

    console.log(this.fileNumber);
    this.doneRunning(this.fileNumber);
  }

  interrupt() {
    this.run = false;
    return this.doneRunning;
  }

  doWork() {
    return Promise.resolve(this.fileNumber++);
  }
}

module.exports = Counter;
