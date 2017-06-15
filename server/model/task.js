const G = require('./global.js');

const TaskStates = {
  CREATED: 'CREATED',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  FAILED: 'FAILED',
}

class Task {
  constructor(userID, taskID) {
    this.id = taskID;
    this.client = G.getUsers().getUser(userID).client;
    this.userID = userID;
    this.state = TaskStates.CREATED;

    if (this.client === null) {
      throw new Error('Task must be created after clients are fully authorized.');
    }
  }

  /**
   * Runs this Task. Only works when the Task is in CREATED or PAUSED states.
   *
   */
  run() {
    if (this.state !== TaskStates.CREATED && this.state !== TaskStates.PAUSED) {
      throw new Error(`Task ${this.id} can only be run from CREATED or PAUSED, but was ${this.state}.`);
    }
    if (this.client === null) {
      throw new Error(`Invalid client. Either the user running this task hasn't authenticated,
        or the client hasn't been built yet.`)
    }

    this.state = TaskStates.RUNNING;
  }

  /**
   * Pauses this Task. Only works when this Task is in RUNNING state.
   *
   */
  pause() {
    this.state = TaskStates.PAUSED;
  }

  doUnitOfWork() {

  }

  getRecentWork() {
    throw new Error('This function must be implemented in a descendant.');
  }
}

module.exports = Task;
