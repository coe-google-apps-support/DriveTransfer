const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
let readFile = require('../util/promisey-read-file.js').readFile;

describe('.promiseyReadFile', () => {
  let fileThatExists = path.join(__dirname, 'a-real-test-file.txt');
  let fileDoesntExist = path.join(__dirname, 'not-a-real-test-file.txt');

  it('Successfully load a file', () => {
    let promise = readFile(fileThatExists);
    return assert.eventually.equal(promise, 'Example text\r\n');
  });

  it('Reject when file dne', () => {
    let promise = readFile(fileDoesntExist);
    return assert.isRejected(promise);
  });
});
