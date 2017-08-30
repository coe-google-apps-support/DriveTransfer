const EJS = require('ejs');
const readFile = require('./promisey-read-file.js').readFile;

function buildRequestEmail(filePath, recipient, initiator, taskID) {
  return readFile(filePath).then((result) => {
    return EJS.render(result, {
      recipient: recipient,
      initiator: initiator,
      taskID: taskID
    });
  });
}

module.exports = buildRequestEmail;
