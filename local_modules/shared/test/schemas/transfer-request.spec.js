const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
require('../../mongoose-provider.js').set(mongoose);
const ObjectId = mongoose.Types.ObjectId;

const TransferRequest = require('../../schemas/transfer-request.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('TransferRequest', () => {

  before(() => {
    return mongoose.connect(url);
  });

  describe('.create', () => {
    it('Successfully creates a transfer_request task', () => {
      let promise = TransferRequest.create({
        userID: 'userID-123',
        transferTask: ObjectId('abcdefghicjk'),
        recipient: {
          email: 'jim.bo@edmonton.ca',
        },
      });

      return assert.isFulfilled(promise);
    });

    it('Fails without a transfer task', () => {
      let promise = TransferRequest.create({
        userID: 'userID-123',
        recipient: {
          email: 'jim.bo@edmonton.ca',
        },
      });

      return assert.isRejected(promise);
    });

    it('Fails without a recipient', () => {
      let promise = TransferRequest.create({
        userID: 'userID-123',
        transferTask: ObjectId('abcdefghicjk'),
      });

      return assert.isRejected(promise);
    });

  });

  after(() => {
    return mongoose.disconnect();
  });
});
