class Task {
  constructor(taskID) {

  }

  run() {
    throw new Error('Implement run() in sub-class.');
  }

  interrupt() {
    throw new Error('Implement interrupt() in sub-class.');
  }
}
module.exports = Task;
