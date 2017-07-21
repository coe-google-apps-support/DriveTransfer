const loadSchemas = require('../../../load-schemas.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

let List;
before(() => {
  loadSchemas();
  List = mongoose.model('listTask');

  return mongoose.connect(url).then(() => {
    return List.remove({});
  })
});

describe('List', () => {

  describe('.create', () => {
    it('Creates an empty List request', () => {
      let listPromise = List.create({
        taskID: 'taskID-abc123',
        userID: 'userID-123',
        folderID: 'fid-123'
      });

      return assert.isFulfilled(listPromise);
    });

    it('Fails when creating a List Task with duplicate IDs', () => {
      let listPromise = List.create({
        taskID: 'dup-id-123',
        userID: 'userID-123',
        folderID: 'fid-123'
      }).then(() => {
        return List.create({
          taskID: 'dup-id-123',
          userID: 'userID-321',
          folderID: 'fid-321'
        });
      });

      return assert.isRejected(listPromise);
    });
  });
});
