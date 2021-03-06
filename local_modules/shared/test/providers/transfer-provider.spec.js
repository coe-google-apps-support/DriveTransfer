const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const MongooseProvider = require('../../mongoose-provider.js').set(mongoose);

const TaskStates = require('../../task-states.js');
const Transfer = require('../../schemas/transfer.js');
const TransferProvider = require('../../providers/transfer-provider.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const url = 'mongodb://localhost:27017/test';

describe('TransferProvider', () => {

  const user1 = 'userID-1';
  const folder1 = 'fid-1';
  const newOwner1 = 'snow.white@edmonton.ca';

  before(() => {
    return mongoose.connect(url);
  });

  describe('.create', () => {
    it('Creates an empty Transfer request', () => {
      let promise = TransferProvider.create(user1, folder1, newOwner1);
      return assert.isFulfilled(promise);
    });
  });

  after(() => {
    return mongoose.disconnect();
  });
});
