const Task = require('./task.js');
const TransferProvider = require('shared/providers/transfer-provider.js');
const TaskProvider = require('shared/providers/task-provider.js');
const ListProvider = require('shared/providers/list-provider.js')
const Config = require('shared/config.js');
const exponentialBackoff = require('shared/util/exponential-backoff.js');
const TaskStates = require('shared/task-states.js');
const onChange = require('../notify-on-change.js');

const TaskSubStates = {
  SENDING_EMAIL: 'Sending email to recipient',
  CREATING_FILTER: 'Creating email filter',
  LISTING: 'Finding files',
  TRANSFERRING: 'Transferring files',
  FINISHED: 'Done'
};

class Transfer extends Task {
  constructor(taskID) {
    super(taskID);
    this.taskID = taskID;

    this.transferState = TaskSubStates.SENDING_EMAIL;
    this.filterTransferRequest = this.filterTransferRequest.bind(this);
    this.filterFilterRequest = this.filterFilterRequest.bind(this);
    this.filterListRequest = this.filterListRequest.bind(this);
    this.oplogWatchers = [];
    this.safeToStop = new Promise((resolve) => {
      this.safeToStopResolve = resolve;
    });
  }

  async setup() {
    return TransferProvider.getDrive(this.taskID).then((drive) => {
      if (!drive) {
        throw new Error('Transfer failed fetching drive');
      }

      this.drive = drive;
      return TransferProvider.getFolder(this.taskID);
    }).then((folderID) => {
      if (!folderID) {
        throw new Error('Transfer failed fetching folderID');
      }

      this.folderID = folderID;
      return TransferProvider.getNewOwnerEmail(this.taskID);
    }).then((owner) => {
      if (!owner) {
        throw new Error('Transfer failed fetching owner');
      }

      this.newOwnerEmail = owner;
      return TransferProvider.getRequestTask(this.taskID);
    }).then((requestTask) => {
      if (!requestTask) {
        throw new Error('Transfer failed fetching request task');
      }

      this.requestTask = requestTask;
      return TransferProvider.getListTask(this.taskID);
    }).then((listTask) => {
      if (!listTask) {
        throw new Error('Transfer failed fetching list task')
      }

      this.listTask = listTask;
      return TransferProvider.getFilterTask(this.taskID);
    }).then((filterTask) => {
      // This is only available if this transfer task has already been run before.
      // The filter task isn't created as soon as the transfer task is.
      this.filterTask = filterTask;
      return Promise.all([
        TaskProvider.getState(this.requestTask),
        TaskProvider.getState(this.filterTask).catch(() => {}),
        TaskProvider.getState(this.listTask),
        TaskProvider.getState(this.taskID),
      ]);
    }).then((states) => {
      console.log(states);
      // This transfer's task state
      if (states[3] === TaskStates.FINISHED) {
        console.log('set to done')
        this.transferState = TaskSubStates.FINISHED;
      }
      // List task state
      else if (states[2] === TaskStates.FINISHED) {
        console.log('set to trans')
        this.transferState = TaskSubStates.TRANSFERRING;
      }
      // Filter task state
      else if (states[1] === TaskStates.FINISHED) {
        console.log('set to list')
        this.transferState = TaskSubStates.LISTING;
      }
      // Request task state
      else if (states[0] === TaskStates.FINISHED) {
        console.log('set to filter')
        this.transferState = TaskSubStates.CREATING_FILTER;
      }
    });
  }

  async run() {
    this.run = true;

    while (this.run) {
      try {
        await this.doWork();
      } 
      catch (err) {
        console.error(err);
        console.log(`Stopping task ${this.taskID} due to error.`);
        break;
      }
    }

    if (this.listValues.cursor) {
      this.listValues.close();
    }    
    this.safeToStopResolve();
  }

  interrupt() {
    if (this.run) {
      this.run = false;
      return this.safeToStop.then(() => {
        this.oplogWatchers.forEach((watcher) => {
          watcher.destroyOPLog();
        });
      });
    }
  }

  cancel() {
    if (this.run) {
      this.run = false;
      return this.safeToStop.then(() => {
        this.oplogWatchers.forEach((watcher) => {
          watcher.destroyOPLog();
        });
      });
    }
  }

  doWork() {
    if (this.transferState === TaskSubStates.SENDING_EMAIL) {
      console.log(TaskSubStates.SENDING_EMAIL);

      TaskProvider.run(this.requestTask);
      let notifier = onChange('tasks', this.filterTransferRequest);
      this.oplogWatchers.push(notifier);
      return notifier.then((action) => {
        this.transferState = TaskSubStates.CREATING_FILTER;
        return TransferProvider.createFilter(this.taskID);
      }).then((filterTask) => {
        this.filterTask = filterTask.task;
        return TransferProvider.getRecipientDrive(this.taskID).then((drive) => {
          this.recipientDrive = drive;
        });
      });
    }
    else if (this.transferState === TaskSubStates.CREATING_FILTER) {
      console.log(TaskSubStates.CREATING_FILTER);

      TaskProvider.run(this.filterTask);
      let notifier = onChange('tasks', this.filterFilterRequest);
      this.oplogWatchers.push(notifier);
      return notifier.then((doc) => {
        this.transferState = TaskSubStates.LISTING;
      });
    }
    else if (this.transferState === TaskSubStates.LISTING) {
      console.log(TaskSubStates.LISTING);

      TaskProvider.run(this.listTask);
      let notifier = onChange('tasks', this.filterListRequest);
      this.oplogWatchers.push(notifier);
      return notifier.then((doc) => {
        this.transferState = TaskSubStates.TRANSFERRING;
        console.log(TaskSubStates.TRANSFERRING);
        this.listValues = ListProvider.getResultCursor(this.listTask);
      });
    }
    else if (this.transferState === TaskSubStates.TRANSFERRING) {
      let fileID;
      // Using an error to break out of a Promise chain seems terrible. There are a lot of people that do it though,
      // so I'm in good company.
      // https://github.com/petkaantonov/bluebird/issues/581
      let notMineError = new Error(`That isn't your file to transfer!`);
      let doneError = new Error('Finished iterating list.');
      
      return this.listValues.next().then((file) => {
        if (!file) {
          this.transferState = TaskSubStates.FINISHED;
          throw doneError;
        }
        else if (!file.ownedByMe) {
          throw notMineError;
        }

        fileID = file.id;
        
        return exponentialBackoff(
          this.transfer.bind(this, fileID, this.newOwnerEmail),
          Config.ExpoBackoff.MAX_TRIES,
          Config.ExpoBackoff.NAPTIME,
          this.transferPredicate
        );
      }).catch((err) => {
        // Catches an error that occurs randomly. We need to catch and dispose so we can still remove the file from the root.
        if ((err.errors && err.errors[0] && err.errors[0].reason === 'invalidSharingRequest') || (err.reason === 'invalidSharingRequest')) {
          return;
        }
        else {
          throw err;
        }        
      }).then(() => {
        return TransferProvider.addResult(this.taskID, fileID);   
      }).then(() => {
        return exponentialBackoff(
          this.removeFileFromRoot.bind(this, fileID),
          Config.ExpoBackoff.MAX_TRIES,
          Config.ExpoBackoff.NAPTIME,
          this.transferPredicate
        );
      }).catch((err) => {
        if (err !== doneError && err !== notMineError) {
          console.log(`Actual error while tranferring ${this.taskID}.`);
          console.error(err);
        }
      });
    }
    else if (this.transferState === TaskSubStates.FINISHED) {
      console.log(TaskSubStates.FINISHED);
      this.interrupt();
      return TaskProvider.finish(this.taskID);
    }
    else {
      console.log(`Unknown TransferState: ${this.transferState}`);
      this.interrupt();
      return TaskProvider.fail(this.taskID);
    }
  }

  filterTransferRequest(doc) {
    if (doc.op === 'u' &&
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.requestTask.toString() &&
      doc.o && doc.o.$set && doc.o.$set.state && doc.o.$set.state === TaskStates.FINISHED) {
      console.log('success');
      return true;
    }

    return false;
  }

  filterFilterRequest(doc) {
    if (doc.op === 'u' &&
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.filterTask.toString() &&
      doc.o && doc.o.$set && doc.o.$set.state && doc.o.$set.state === TaskStates.FINISHED) {

      return true;
    }

    return false;
  }

  filterListRequest(doc) {
    if (doc.op === 'u' &&
      doc.o2 && doc.o2._id && doc.o2._id.toString() === this.listTask.toString() &&
      doc.o && doc.o.$set && doc.o.$set.state && doc.o.$set.state === TaskStates.FINISHED) {

      return true;
    }

    return false;
  }

  transferPredicate(error) {
    if (!error.errors || error.errors[0]) {
      console.log('non-api error');
      return false;
    }

    let firstError = error.errors[0];
    if ((error.code === 403 && firstError.reason === 'userRateLimitExceeded') ||
      (error.code === 403 && firstError.reason === 'rateLimitExceeded') ||
      (error.code === 429 && firstError.reason === 'rateLimitExceeded') ||
      (error.code === 500 && firstError.reason === 'backendError')) {
      console.log('Retrying');
      return true;
    }

    console.log('Don\'t retry');
    return false;
  }

  transfer(fileID, newOwnerEmail) {
    return new Promise((resolve, reject) => {
      this.drive.permissions.create({
        fileId: fileID,
        transferOwnership: true,
        emailMessage: Config.Tasks.Transfer.EMAIL_MESSAGE,
        resource: {
          emailAddress: newOwnerEmail,
          role: 'owner',
          type: 'user',
        },
      }, function(err, response) {
        if (err != null) {
          reject(err);
          return;
        }

        resolve(response);
      });
    });
  }

  removeFileFromRoot(fileID) {
    console.log(`removing ${fileID}`);
    return new Promise((resolve, reject) => {
      this.recipientDrive.files.update({
        fileId: fileID,
        removeParents: 'root'
      },
        function(err, response) {
          if (err != null) {
            reject(err);
            return;
          }

          resolve();
      });
    });
  }

}

module.exports = Transfer;
