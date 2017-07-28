class Task {
  constructor(taskID) {

  }

  setup() {
    throw new Error('Implement setup() in sub-class.')
  }

  run() {
    throw new Error('Implement run() in sub-class.');
  }

  interrupt() {
    throw new Error('Implement interrupt() in sub-class.');
  }
}
module.exports = Task;
