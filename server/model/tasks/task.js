const G = require('../global.js');
const TaskStates = require('./task-states.js');
const EventEmitter = require('events');

class Task extends EventEmitter {
  constructor(userID, taskID) {
    super();

    this.id = taskID;
    this.client = G.getUsers().getUser(userID).client;
    this.userID = userID;
    this.state = TaskStates.CREATED;
    this.result = {};

    if (this.client === null) {
      throw new Error('Task must be created after clients are fully authorized.');
    }
  }

  /**
   * Runs this Task. Only works when the Task is in CREATED or PAUSED states.
   *
   */
  async run() {
    if (this.state !== TaskStates.CREATED && this.state !== TaskStates.PAUSED) {
      throw new Error(`Task ${this.id} can only be run from CREATED or PAUSED, but was ${this.state}.`);
    }
    if (this.client === null) {
      throw new Error(`Invalid client. Either the user running this task hasn't authenticated,
        or the client hasn't been built yet.`)
    }

    this.state = TaskStates.RUNNING;
    this.emit(TaskStates.RUNNING);

    while(this.state == TaskStates.RUNNING){
      let value = this.doUnitOfWork();
      await value;
    }
  }

  /**
   * Pauses this Task. Only works when this Task is in RUNNING state.
   *
   */
  pause() {
    this.state = TaskStates.PAUSED;
    this.emit(TaskStates.PAUSED);
  }

  async doUnitOfWork() {
    throw new Error('doUnitOfWork must be implemented in a descendant.');
  }

  getRecentWork() {
    throw new Error('getRecentWork must be implemented in a descendant.');
  }
}

module.exports = Task;
