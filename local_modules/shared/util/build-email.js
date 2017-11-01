const EJS = require('ejs');
const Config = require('../config.js');
const readFile = require('./promisey-read-file.js').readFile;

function buildRequestEmail(filePath, recipient, initiator, taskID) {
  return readFile(filePath).then((result) => {
    return EJS.render(result, {
      recipient: recipient,
      initiator: initiator,
      taskID: taskID,
      host: Config.Web.HOST,
      port: Config.Web.PORT,
    });
  });
}

module.exports = buildRequestEmail;
