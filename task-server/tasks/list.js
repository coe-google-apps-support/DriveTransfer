require('shared/util/object-filter.js');
const Task = require('./task.js');
const ListProvider = require('shared/providers/list-provider.js');
const UserProvider = require('shared/providers/user-provider.js');
const Config = require('shared/config.js');
const exponentialBackoff = require('shared/util/exponential-backoff.js')

class List extends Task {

  constructor(taskID) {
    super(taskID);
    this.taskID = taskID;
    this.whenDone = new Promise((resolve, reject) => {
      this._whenDoneResolve = resolve;
      this._whenDoneReject = reject;
    });
  }

  async setup() {
    return ListProvider.getDrive(this.taskID).then((drive) => {
      this.drive = drive;
      return ListProvider.getFolder(this.taskID);
    }).then((folderID) => {
      return this.getFirstFile(folderID);
    }).then((folder) => {
      this._it = this.listFiles(folder);
    });
  }

  async run() {
    this.run = true;

    while (this.run) {
      await this.doWork();
    }
  }

  interrupt() {
    this.run = false;
  }

  async doWork() {
    if (!this._it) {
      throw new Error(`This task hasn't properly initialized.`);
    }

    let fileYield = this._it.next();
    let childrenYield = this._it.next();

    if (fileYield.done || childrenYield.done) {
      this.run = false;
      this._whenDoneResolve();
      return;
    }

    let file = await fileYield.value;
    let children = await childrenYield.value;
  }

  _predicate(error) {
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

  /**
   * This function recursively moves through a Google Drive folder given a file.
   * Generators are used to control the flow of this function.
   * It yields the file, then that file's children.
   * https://derickbailey.com/2015/07/19/using-es6-generators-to-recursively-traverse-a-nested-data-structure/
   * Limitations:
   * - Drive folders can appear in multiple places.
   *   This can mean you visit the same sub-folder structures multiple times.
   * - I've been trying to determine if you can have a loop in a Google Drive folder structure.
   *   It seems you can't, but if you could, this function would get stuck in an infinite loop.
   * http://stackoverflow.com/questions/43793895/is-it-possible-for-google-drives-folder-structure-to-contain-a-loop
   *
   * @param {File} file A Google Drive File Object. See here: https://developers.google.com/drive/v3/reference/files
   */
  * listFiles(file) {
    yield Promise.resolve(file);

    let children;
    let doneChildren = this.getChildren(file.id).then((response) => {
      children = response.files;
      return children;
    });

    yield doneChildren;
    if (children.length === 0) {
      console.log(`Saving file ${file.name}`);
      ListProvider.addResult(this.taskID, file);
      return;
    }

    for (let folder of children) {
      yield* this.listFiles(folder);
    }

    console.log(`Saving folder ${file.name}`);
    ListProvider.addResult(this.taskID, file);
  }

  /**
   * Gets the children of the file denoted by id.
   *
   * @param {string} id The id of a Google Drive file or folder.
   * @param {string} [continuationToken] An optional token that can be used to handle large lists of files.
   * @return {Promise} Contains the results of the query.
   */
  getChildren(id, continuationToken) {
    return exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.drive.files.list({
          fields: 'files, nextPageToken',
          q: `'${id}' in parents and trashed=false`,
          pageToken: continuationToken,
        }, function(err, response) {
          if (err != null) {
            reject(err);
            return;
          }

          //Transform each file to match
          response.files.forEach((file, index) => {
            response.files[index] = Object.filterByKey(file, (key) => {
              return Config.Tasks.FIELDS.includes(key);
            });
          });

          resolve(response);
        });
      }).then((oldResponse) => {
        if (oldResponse.nextPageToken) {
          return this.getChildren(id, oldResponse.nextPageToken).then((response) => {
            Array.prototype.push.apply(response.files, oldResponse.files);
            return response;
          });
        }

        return oldResponse;
      });
    }, Config.ExpoBackoff.MAX_TRIES, Config.ExpoBackoff.NAPTIME, this._predicate);
  }

  /**
   * Gets the first file for initiating the generator function. This must be called prior to using listFiles.
   *
   * @param {string} id The id of the folder.
   * @return {Promise} Contains the file as a result.
   */
  getFirstFile(id) {
    return exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.drive.files.get({
          fileId: id,
          fields: Config.Tasks.FIELDS.join(', '),
        }, function(err, response) {
          if (err != null) {
            reject(err);
            return;
          }

          resolve(response);
        });
      });
    }, Config.ExpoBackoff.MAX_TRIES, Config.ExpoBackoff.NAPTIME, this._predicate);
  }
}

module.exports = List;
