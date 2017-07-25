const loadSchemas = require('../../../load-schemas.js');
const TaskStates = require('../../../model/tasks/task-states.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('ListProvider', () => {

  let ListProvider;
  let List;
  const user1 = 'userID-1';
  const folder1 = 'fid-1';
  const user2 = 'userID-2';
  const folder2 = 'fid-2';
  const listResult1 = {
    'id': 'file-1',
    'name': 'a file',
    'createdTime': new Date(),
    'mimeType': 'application/vnd.google-apps.document',
    'webViewLink': 'https://docs.google.com/document/d/1uMLbfXnUrNY00xiq67zX6l1fc_A8uE_HxaG4p-TOpWQ/edit',
    'iconLink': 'sdfasdfasdf',
    'parents': [
      "0B7CO9MICkOKgWXpXajRzX01Qbm8",
      "0B7CO9MICkOKgc2FkbmNiNTFHckU"
    ]
  }


  before(() => {
    loadSchemas();
    List = mongoose.model('list_task');
    ListProvider = require('../../../controller/providers/list-provider.js');
    return mongoose.connect(url);
  });

  beforeEach(() => {
    return List.remove({});
  });

  describe('.create', () => {
    it('Creates an empty List request', () => {
      let listPromise = ListProvider.create(user1, folder1);
      return assert.isFulfilled(listPromise);
    });
  });

  /*describe('.run', () => {
    it('Runs a CREATED list_task', () => {
      let listPromise = ListProvider.create(user1, folder1).then((task) => {
        assert.equal(task.state, TaskStates.CREATED);
        return ListProvider.run(task._id, user1);
      }).then((task) => {
        assert.equal(task.state, TaskStates.RUNNING);
      });

      return assert.isFulfilled(listPromise);
    });
  });

  describe('.pause', () => {
    it('Pauses a CREATED list_task', () => {
      let listPromise = ListProvider.create(user1, folder1).then((task) => {
        assert.equal(task.state, TaskStates.CREATED);
        return ListProvider.pause(task._id, user1);
      }).then((task) => {
        assert.equal(task.state, TaskStates.PAUSED);
      });

      return assert.isFulfilled(listPromise);
    });

    it('Pauses a RUNNING list_task', () => {
      let listPromise = ListProvider.create(user2, folder2).then((task) => {
        assert.equal(task.state, TaskStates.CREATED);
        return ListProvider.run(task._id, user2);
      }).then((task) => {
        assert.equal(task.state, TaskStates.RUNNING);
        return ListProvider.pause(task._id, user2);
      }).then((task) => {
        assert.equal(task.state, TaskStates.PAUSED);
      });

      return assert.isFulfilled(listPromise);
    });
  });*/

  describe('.getResult', () => {
    it('Returns a simple result', () => {
      let listPromise = ListProvider.create(user1, folder1).then((task) => {
        console.log("CLEEEEEEEEEEEEEEEEEEEAR")
        console.log(task);
        return ListProvider.addResult(task._id, user1, listResult1);
      }).then((task) => {
        return ListProvider.getResult(task._id, user1);
      }).then((result) => {
        assert.equal(listResult1.id, result[0].id);
        assert.equal(listResult1.name, result[0].name);
        assert.equal(listResult1.createdTime.getTime(), result[0].createdTime.getTime());
        assert.equal(listResult1.mimeType, result[0].mimeType);
        assert.equal(listResult1.webViewLink, result[0].webViewLink);
        assert.equal(listResult1.iconLink, result[0].iconLink);
        assert.sameMembers(listResult1.parents, result[0].parents);
      });

      return assert.isFulfilled(listPromise);
    });
  });

  describe('.addResult', () => {
    it('Adds a simple list result', () => {
      let listPromise = ListProvider.create(user1, folder1).then((task) => {
        return ListProvider.addResult(task._id, user1, listResult1);
      }).then((task) => {
        return ListProvider.getResult(task._id, user1);
      }).then((result) => {
        assert.equal(listResult1.id, result[0].id);
        assert.equal(listResult1.name, result[0].name);
        assert.equal(listResult1.createdTime.getTime(), result[0].createdTime.getTime());
        assert.equal(listResult1.mimeType, result[0].mimeType);
        assert.equal(listResult1.webViewLink, result[0].webViewLink);
        assert.equal(listResult1.iconLink, result[0].iconLink);
        assert.sameMembers(listResult1.parents, result[0].parents);
      });

      return assert.isFulfilled(listPromise);
    });
  });

  after(() => {
    return mongoose.disconnect();
  });
});
