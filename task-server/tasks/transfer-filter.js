const Task = require('./task.js');
const Config = require('shared/config.js');
const exponentialBackoff = require('shared/util/exponential-backoff.js')
const FilterProvider = require('shared/providers/transfer-filter-provider.js');
const TaskProvider = require('shared/providers/task-provider.js');

const FILTER_QUERY = `"${Config.Tasks.Transfer.EMAIL_MESSAGE}"`;

class TransferFilter extends Task {

  constructor(taskID) {
    super(taskID);
    this.taskID = taskID;
  }

  async setup() {
    return FilterProvider.getGmail(this.taskID).then((gmail) => {
      if (!gmail) {
        throw new Error('TransferFilter failed fetching gmail.');
      }

      this.gmail = gmail;
    });
  }

  async run() {
    this.run = true;
    await this.doWork();
  }

  interrupt() {
    this.run = false;
  }

  cancel() {
    this.run = false;
  }

  doWork() {
    return exponentialBackoff(
      this.createFilter.bind(this),
      Config.ExpoBackoff.MAX_TRIES,
      Config.ExpoBackoff.NAPTIME).then(() => {
        return TaskProvider.finish(this.taskID);
      });
  }

  createFilter() {
    return new Promise((resolve, reject) => {
      this.gmail.users.settings.filters.create({
        userId: 'me',
        resource: {
          action: {
            addLabelIds: ['TRASH'],
          },
          criteria: {
            query: FILTER_QUERY
          }
        }
      },
      function(err, response) {
        if (err != null && err.code === 400) {
          // The filter already existed.
          resolve();
          return;
        }
        else if (err != null) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

}

module.exports = TransferFilter;
