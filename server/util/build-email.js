const EJS = require('ejs');
const readFile = require('./promisey-read-file.js').readFile;

function buildRequestEmail(filePath, recipient, folderID, initiator, taskID) {
  return readFile(filePath).then((result) => {
    return EJS.render(result, {
      recipient: recipient,
      folderID: folderID,
      initiator: initiator,
      taskID: taskID
    });
  });
}

module.exports = buildRequestEmail;
