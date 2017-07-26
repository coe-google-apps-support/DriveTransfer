const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const exponentialBackoff = require('../util/exponential-backoff.js');

describe('.exponentialBackoff', () => {

  it('should succeed when run with successful functions with no backoff', () => {
    let prom = exponentialBackoff(() => {
      return Promise.resolve();
    }, 0, 1);

    return assert.isFulfilled(prom);
  });

  it('should fail when run with failing functions with no backoff', () => {
    let prom = exponentialBackoff(() => {
      return Promise.reject();
    }, 0, 1);

    return assert.isRejected(prom);
  });

  it('should succeed when run with 1 fail, then 1 success with 1 backoff attempt', () => {
    let callNumber = 0;
    let prom = exponentialBackoff(() => {
      if (callNumber === 0) {
        callNumber++;
        return Promise.reject();
      }

      return Promise.resolve();
    }, 1, 1);

    return assert.isFulfilled(prom);
  });

  it('should fail when run with 2 fails with 1 backoff attempt', () => {
    let callNumber = 0;
    let prom = exponentialBackoff(() => {
      if (callNumber < 2) {
        callNumber++;
        return Promise.reject();
      }

      return Promise.resolve();
    }, 1, 1);

    return assert.isRejected(prom);
  });

  it('should allow errors to be filtered out', () => {
    let predicate = (err) => { return err.message === 'RETRY' ? true : false };

    // The NO_RETRY message doesn't cause a retry, therefore, it fails.
    let callNumber1 = 0;
    let prom1 = exponentialBackoff(() => {
      if (callNumber1 === 0) {
        callNumber1++;
        return Promise.reject(new Error('NO_RETRY'));
      }

      return Promise.resolve();
    }, 1, 1, predicate);

    assert.isRejected(prom1);

    // The RETRY error message causes a retry, therefore, it succeeds.
    let callNumber2 = 0;
    let prom2 = exponentialBackoff(() => {
      if (callNumber2 === 0) {
        callNumber2++;
        return Promise.reject(new Error('RETRY'));
      }

      return Promise.resolve();
    }, 1, 1, predicate);

    assert.isFulfilled(prom2);
  });

  it('should allow errors to be responded to', () => {
    let callNumber = 0;
    let prom = exponentialBackoff(() => {
      if (callNumber === 0) {
        callNumber++;
        return Promise.reject(new Error('RETRY'));
      }

      return Promise.resolve();
    }, 1, 1, (err) => { return err.message === 'RETRY' ? true : false });

    return assert.isFulfilled(prom);
  });
});
