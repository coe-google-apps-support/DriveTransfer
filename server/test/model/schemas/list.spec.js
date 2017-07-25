const loadSchemas = require('../../../load-schemas.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('List', () => {

  let List;
  before(() => {
    loadSchemas();
    List = mongoose.model('list_task');

    return mongoose.connect(url).then(() => {
      return List.remove({});
    });
  });

  describe('.create', () => {
    it('Creates one List task', () => {
      let listPromise = List.create({
        userID: 'userID-123',
        folderID: 'fid-123'
      });

      return assert.isFulfilled(listPromise);
    });

    it('Creates multiple List tasks', () => {
      let listPromise = List.create({
        userID: 'userID-123',
        folderID: 'fid-123'
      }).then((task) => {
        return List.create({
          userID: 'userID-123',
          folderID: 'fid-123'
        });
      })

      return assert.isFulfilled(listPromise);
    });

  });

  after(() => {
    return mongoose.disconnect();
  });
});
