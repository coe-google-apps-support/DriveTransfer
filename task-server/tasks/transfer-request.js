const Task = require('./task.js');
const Config = require('shared/config.js');
const exponentialBackoff = require('shared/util/exponential-backoff.js')
const RequestProvider = require('shared/providers/transfer-request-provider.js');
const getRequestEmail = require('shared/util/build-email.js');
const EMAIL_PATH = './resources/request-email.txt';

class TransferRequest extends Task {

  constructor(taskID) {
    super(taskID);
    this.taskID = taskID;
    this.whenDone = new Promise((resolve, reject) => {
      this._whenDoneResolve = resolve;
      this._whenDoneReject = reject;
    });

    this.sendEmail = this.sendEmail.bind(this);
  }

  async setup() {
    return RequestProvider.getAppGmail().then((gmail) => {
      this.gmail = gmail;
      return RequestProvider.getRecipient(this.taskID);
    }).then((recipient) => {
      this.recipient = recipient;
      return RequestProvider.getFolderID(this.taskID);
    }).then((folderID) => {
      this.folderID = folderID;
    });
  }

  async run() {
    this.run = true;
    await this.doWork();
  }

  interrupt() {
    this.run = false;
  }

  doWork() {
    return getRequestEmail(EMAIL_PATH, this.recipient, Config.App.EMAIL, this.taskID).then((result) => {
      let encodedEmailBody = new Buffer(result).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
      return exponentialBackoff(
        this.sendEmail.bind(this, encodedEmailBody),
        Config.ExpoBackoff.MAX_TRIES,
        Config.ExpoBackoff.NAPTIME
      );
    });
  }

  sendEmail(messageBody) {
    return new Promise((resolve, reject) => {
      this.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: messageBody,
        },
        media: {
          mimeType: 'message/rfc822',
        },
      },
      function(err, response) {
        if (err != null) {
          reject(err);
          return;
        }

        resolve(response);
      });
    })
  }

}

module.exports = TransferRequest;
