
const TaskStates = {
  CREATED: 'CREATED',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  FAILED: 'FAILED',
}

class Task {
  constructor(userID) {
    this.client = null;
    this.userID = userID;
    this.state = TaskStates.CREATED;
  }

  /**
   * Runs this Task. Only works when the Task is in CREATED or PAUSED states.
   *
   */
  run() {
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
