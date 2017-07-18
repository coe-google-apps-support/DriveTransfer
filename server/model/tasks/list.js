const Google = require('googleapis');
const exponentialBackoff = require('../../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('./task.js');
const TaskStates = require('./task-states.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;
const FIELDS = [
  'id',
  'name',
  'createdTime',
  'mimeType',
  'webViewLink',
  'iconLink',
  'parents',
];


class List extends Task {
  constructor(userID, taskID, folderID) {
    super(userID, taskID);
    this.drive = null;
    this.result.fileList = new Map();
    this.folderID = folderID;

    this._predicate = this._predicate.bind(this);
  }

  setup() {
    return super.setup().then(() => {
      this.drive = Google.drive({ version: 'v3', auth: this.client });
      return this.getFirstFile(this.folderID);
    }).then((file) => {
      this._it = this.listFiles(file);
    });
  }

  /**
   * This is the overridden function from the parent Task class. This does a single iteration of the list operation.
   * In this case, this involves grabbing the current id and it's children. Every call to this function is a call
   * to Google's Drive API. Rate limiting this function can help deal with overages.
   *
   * @return {Promise} A Promise that has a string id as it's response value.
   */
  async doUnitOfWork() {
    if (this._it == undefined) {
      throw new Error(`This task hasn't properly initialized.`);
    }

    let fileYield = this._it.next();
    let childrenYield = this._it.next();
    await childrenYield.value;

    if (fileYield.done || childrenYield.done) {
      this.result.state = TaskStates.FINISHED;
      this.emit(TaskStates.FINISHED);
    }
    else {
      fileYield.value.then((value) => {
        this.result.fileList.set(value.id, value);
      }).catch((err) => {
        console.log(err);
      });
    }

    return fileYield.value;
  }

  _predicate(error) {
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
  *listFiles(file){
    yield Promise.resolve(file);

    let children;
    let doneChildren = this.getChildren(file.id).then((response) => {
      children = response.files;
      return children;
    });

    yield doneChildren;
    if (children.length === 0) {
      return;
    }

    for (let folder of children) {
      yield *this.listFiles(folder);
    }
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
              return FIELDS.includes(key);
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
    }, MAX_TRIES, NAPTIME, this._predicate);
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
          fields: FIELDS.join(', '),
        }, function(err, response) {
          if (err != null) {
            reject(err);
            return;
          }

          resolve(response);
        });
      });
    }, MAX_TRIES, NAPTIME, this._predicate);
  }
}

module.exports = List;
