const loadSchemas = require('../../../load-schemas.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('Task', () => {

  let Task;
  before(() => {
    loadSchemas();
    Task = mongoose.model('task');

    return mongoose.connect(url).then(() => {
      return Task.remove({});
    });
  });

  describe('.create', () => {
    it('Creates an empty Task request', () => {
      let taskPromise = Task.create({
        taskID: 'taskID-abc123',
        userID: 'userID-123',
        taskType: 'fake_task',
      });

      return assert.isFulfilled(taskPromise);
    });

    it('Fails when creating a Task with duplicate IDs', () => {
      let taskPromise = Task.create({
        taskID: 'dup-id-123',
        userID: 'userID-123',
        taskType: 'fake_task',
      }).then(() => {
        return Task.create({
          taskID: 'dup-id-123',
          userID: 'userID-321',
          taskType: 'fake_task',
        });
      });

      return assert.isRejected(taskPromise);
    });

    it('Fails when creating a Task with no type', () => {
      let taskPromise = Task.create({
        taskID: 'dup-id-123',
        userID: 'userID-123',
      });

      return assert.isRejected(taskPromise);
    });
  });

  after(() => {
    return mongoose.disconnect();
  });
});
