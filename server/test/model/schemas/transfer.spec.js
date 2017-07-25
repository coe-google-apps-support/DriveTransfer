const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const Transfer = require('../../../model/schemas/transfer.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('Transfer', () => {

  before(() => {
    return mongoose.connect(url);
  });

  describe('.create', () => {
    it('Creates one Transfer task', () => {
      let promise = Transfer.create({
        userID: 'userID-123',
        folderID: 'fid-123',
        newOwner: {email: 'snow.white@edmonton.ca'},
      });

      return assert.isFulfilled(promise);
    });

    it('Creates multiple Transfer tasks', () => {
      let promise = Transfer.create({
        userID: 'userID-123',
        folderID: 'fid-123',
        newOwner: {email: 'snow.white@edmonton.ca'},
      }).then((task) => {
        return Transfer.create({
          userID: 'userID-123',
          folderID: 'fid-123',
          newOwner: {email: 'snow.white@edmonton.ca'},
        });
      })

      return assert.isFulfilled(promise);
    });

    it('Creates a task document', () => {
      let promise = Transfer.create({
        userID: 'userID-123',
        folderID: 'fid-123',
        newOwner: {email: 'snow.white@edmonton.ca'},
      }).then((transferTask) => {
        return Transfer.findOne(transferTask)
          .populate('task')
          .exec()
          .then((popDoc) => {
            assert.equal(transferTask.task.toString(), popDoc.task._id.toString());
          });
      })

      return assert.isFulfilled(promise);
    });

  });

  after(() => {
    return mongoose.disconnect();
  });
});
