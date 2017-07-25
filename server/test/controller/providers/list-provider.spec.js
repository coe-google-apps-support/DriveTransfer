const TaskStates = require('../../../model/tasks/task-states.js');
const List = require('../../../model/schemas/list.js');
const ListProvider = require('../../../controller/providers/list-provider.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('ListProvider', () => {

  const user1 = 'userID-1';
  const folder1 = 'fid-1';
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
    return mongoose.connect(url);
  });

  describe('.create', () => {
    it('Creates an empty List request', () => {
      let listPromise = ListProvider.create(user1, folder1);
      return assert.isFulfilled(listPromise);
    });
  });

  describe('.getResult', () => {
    it('Returns a simple result', () => {
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
