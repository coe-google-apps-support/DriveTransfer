const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const List = require('../../../model/schemas/list.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('List', () => {

  before(() => {
    return mongoose.connect(url);
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

    it('Creates a task document', () => {
      let listPromise = List.create({
        userID: 'userID-123',
        folderID: 'fid-123'
      }).then((listTask) => {
        return List.findOne(listTask)
          .populate('task')
          .exec()
          .then((popDoc) => {
            assert.equal(listTask.task.toString(), popDoc.task._id.toString());
          });
      })

      return assert.isFulfilled(listPromise);
    });

  });

  after(() => {
    return mongoose.disconnect();
  });
});
