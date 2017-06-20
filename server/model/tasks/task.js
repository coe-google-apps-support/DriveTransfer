const G = require('../global.js');
const TaskStates = require('./task-states.js');
const EventEmitter = require('events');

class Task extends EventEmitter {
  constructor(userID, taskID) {
    super();

    this.id = taskID;
    this.client = G.getUsers().getUser(userID).client;
    this.userID = userID;
    this.result = {};
    this.recent = {};
    this.result.state = TaskStates.CREATED;
    this.recent.state = TaskStates.CREATED;

    if (this.client === null) {
      throw new Error('Task must be created after clients are fully authorized.');
    }
  }

  /**
   * Runs this Task. Only works when the Task is in CREATED or PAUSED states.
   *
   */
  async run() {
    if (this.result.state !== TaskStates.CREATED && this.result.state !== TaskStates.PAUSED) {
      throw new Error(`Task ${this.id} can only be run from CREATED or PAUSED, but was ${this.result.state}.`);
    }
    if (this.client === null) {
      throw new Error(`Invalid client. Either the user running this task hasn't authenticated,
        or the client hasn't been built yet.`)
    }

    this.result.state = TaskStates.RUNNING;
    this.recent.state = TaskStates.RUNNING;
    this.emit(TaskStates.RUNNING);

    while(this.result.state == TaskStates.RUNNING){
      let value = this.doUnitOfWork();
      await value;
    }
  }

  /**
   * Some tasks have additional setup needed after running the constructor. These tasks override this function.
   *
   */
  setup() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  /**
   * Pauses this Task. Only works when this Task is in RUNNING state.
   *
   */
  pause() {
    this.result.state = TaskStates.PAUSED;
    this.recent.state = TaskStates.PAUSED;
    this.emit(TaskStates.PAUSED);
  }

  async doUnitOfWork() {
    throw new Error('doUnitOfWork must be implemented in a descendant.');
  }

  getRecentWork() {
    return this.recent;
  }

  getResult() {
    return this.result;
  }
}

module.exports = Task;
