class Task {
  constructor(taskID) {

  }

  /**
   * Must be called prior to running this task. Establishes task state from the database.
   * @return {Promise} Resolved upon successful setup.
   */
  setup() {
    throw new Error('Implement setup() in sub-class.')
  }

  /**
   * Runs this task. Note that this may cause sub-tasks to be run.
   */
  run() {
    throw new Error('Implement run() in sub-class.');
  }

  interrupt() {
    throw new Error('Implement interrupt() in sub-class.');
  }

  /**
   * Cancels this task. This should also cancel all subtasks.
   *
   */
  cancel() {
    throw new Error('Implement cancel() in sub-class.');
  }
}
module.exports = Task;
