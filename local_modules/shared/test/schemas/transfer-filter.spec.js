const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
require('../../mongoose-provider.js').set(mongoose);
const ObjectId = mongoose.Types.ObjectId;

const TransferFilter = require('../../schemas/transfer-filter.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('TransferFilter', () => {

  before(() => {
    return mongoose.connect(url);
  });

  describe('.create', () => {
    it('Successfully creates a transfer_filter task', () => {
      let promise = TransferFilter.create({
        userID: 'userID-123',
        transferTask: ObjectId('abcdefghicjk'),
      });

      return assert.isFulfilled(promise);
    });

    it('Fails without a transfer task', () => {
      let promise = TransferFilter.create({
        userID: 'userID-123',
      });

      return assert.isRejected(promise);
    });

  });

  after(() => {
    return mongoose.disconnect();
  });
});
