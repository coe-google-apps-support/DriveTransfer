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
    it('Fails when creating without a subTask', () => {
      let taskPromise = Task.create({
        taskID: 'taskID-abc123',
        userID: 'userID-123',
        taskType: 'list_task',
      });

      return assert.isRejected(taskPromise);
    });

  });

  after(() => {
    return mongoose.disconnect();
  });
});
