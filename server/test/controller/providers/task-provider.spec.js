const TaskStates = require('../../../model/tasks/task-states.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const TaskProvider = require('../../../controller/providers/task-provider.js');
const ListProvider = require('../../../controller/providers/list-provider.js');
const Task = require('../../../model/schemas/task.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('TaskProvider', () => {

  before(() => {
    return mongoose.connect(url);
  });

  describe('.run', () => {
    it('Runs a CREATED list_task', () => {
      let promise = ListProvider.create('userID-1', 'folderID-1').then((listTask) => {
        return TaskProvider.run(listTask.task);
      }).then((task) => {
        assert.equal(task.state, TaskStates.RUNNING);
      });

      return assert.isFulfilled(promise);
    });

    it('Runs a PAUSED list_task', () => {
      let promise = ListProvider.create('userID-1', 'folderID-1').then((listTask) => {
        return TaskProvider.pause(listTask.task);
      }).then((task) => {
        assert.equal(task.state, TaskStates.PAUSED);
        return TaskProvider.run(task._id);
      }).then((task) => {
        assert.equal(task.state, TaskStates.RUNNING);
      });

      return assert.isFulfilled(promise);
    });
  });

  describe('.pause', () => {
    it('Pauses a CREATED list_task', () => {
      let promise = ListProvider.create('userID-1', 'folderID-1').then((listTask) => {
        return TaskProvider.pause(listTask.task);
      }).then((task) => {
        assert.equal(task.state, TaskStates.PAUSED);
      });

      return assert.isFulfilled(promise);
    });

    it('Pauses a RUNNING list_task', () => {
      let promise = ListProvider.create('userID-1', 'folderID-1').then((listTask) => {
        return TaskProvider.run(listTask.task);
      }).then((task) => {
        assert.equal(task.state, TaskStates.RUNNING);
        return TaskProvider.pause(task._id);
      }).then((task) => {
        assert.equal(task.state, TaskStates.PAUSED);
      });

      return assert.isFulfilled(promise);
    });
  });

  after(() => {
    return mongoose.disconnect();
  });
});
