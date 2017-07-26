const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const buildEmail = require('../../util/build-email.js');
let eol = require('os').EOL;

const INITIATOR = 'user1@email.com';
const RECIPIENT = 'user2@email.com';
const FOLDER_ID = '123456_folder';
const TASK_ID = '123456_task';
const TEST_EMAIL =
`Content-Type: text/html; charset="UTF-8"${eol}\
MIME-Version: 1.0${eol}\
Content-Transfer-Encoding: 7bit${eol}\
to: ${RECIPIENT}${eol}\
from: ${INITIATOR}${eol}\
subject: This is the subject${eol}\
${eol}\
This is the body${eol}\
Folder: ${FOLDER_ID}${eol}\
Task: ${TASK_ID}${eol}\
`;

describe('.buildEmail', () => {
  let emailPath = path.join(__dirname, 'test-email.txt');
  let emailWrongPath = path.join(__dirname, 'dne-email.txt');

  it('Successfully load an email', () => {
    let promise = buildEmail(emailPath, RECIPIENT, FOLDER_ID, INITIATOR, TASK_ID);
    return assert.eventually.equal(promise, TEST_EMAIL);
  });

  it('Reject when email file dne', () => {
    let promise = buildEmail(emailWrongPath, RECIPIENT, FOLDER_ID, INITIATOR, TASK_ID);
    return assert.isRejected(promise);
  });
});
