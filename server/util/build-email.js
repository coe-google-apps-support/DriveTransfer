const EJS = require('ejs');
const readFile = require('./promisey-read-file.js').readFile;

exports.buildRequestEmail = function(recipient, initiator) {
  return readFile('./resources/request-email.txt').then((result) => {
    return EJS.render(result, {
      recipient: recipient,
      initiator: initiator
    });
  });
}
