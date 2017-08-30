const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const MongooseProvider = require('../../mongoose-provider.js').set(mongoose);

const TaskStates = require('../../task-states.js');
const List = require('../../schemas/list.js');
const ListProvider = require('../../providers/list-provider.js');
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

  after(() => {
    return mongoose.disconnect();
  });
});
