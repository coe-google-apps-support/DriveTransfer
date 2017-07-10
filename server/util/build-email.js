const EJS = require('ejs');
const readFile = require('./promisey-read-file.js').readFile;

exports.buildRequestEmail = function(recipient, folderID, initiator, taskID) {
  return readFile('./resources/request-email.txt').then((result) => {
    return EJS.render(result, {
      recipient: recipient,
      folderID: folderID,
      initiator: initiator,
      taskID: taskID
    });
  });
}
