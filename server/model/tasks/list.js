const Google = require('googleapis');
const exponentialBackoff = require('../../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('./task.js');
const TaskStates = require('./task-states.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;

class List extends Task {
  constructor(userID, taskID, folderID) {
    super(userID, taskID);
    this.drive = Google.drive({ version: 'v3', auth: this.client });
    this._it = this.listIDsGenerator(folderID);
    this.result.idList = [];
  }

  /**
   * This is the overridden function from the parent Task class. This does a single iteration of the list operation.
   * In this case, this involves grabbing the current id and it's children. Every call to this function is a call
   * to Google's Drive API. Rate limiting this function can help deal with overages.
   *
   * @return {Promise} A Promise that has a string id as it's response value.
   */
  async doUnitOfWork() {
    let idYield = this._it.next();
    let childrenYield = this._it.next();
    await childrenYield.value;
    
    if (idYield.done || childrenYield.done) {
      this.state = TaskStates.FINISHED;
      this.emit(TaskStates.FINISHED);
    }
    else {
      idYield.value.then((value) => {
        this.result.idList.push(value)
      }).catch((err) => {
        console.log(err);
      });
    }

    return idYield.value;
  }

   /**
    * This function recursively moves through a Google Drive folder given a folder id.
    * Generators are used to control the flow of this function.
    * It yields the id, then that IDs children.
    * https://derickbailey.com/2015/07/19/using-es6-generators-to-recursively-traverse-a-nested-data-structure/
    * Limitations:
    * - Drive folders can appear in multiple places.
    *   This can mean you visit the same sub-folder structures multiple times.
    * - Currently, the returned results aren't guaranteed to be unique. TODO.
    * - I've been trying to determine if you can have a loop in a Google Drive folder structure.
    *   It seems you can't, but if you could, this function would get stuck in an infinite loop.
    * http://stackoverflow.com/questions/43793895/is-it-possible-for-google-drives-folder-structure-to-contain-a-loop
    *
    * @param {string} id The id of a Google Drive folder.
    */
  *listIDsGenerator(id){
    yield Promise.resolve(id);

    let children;
    let doneChildren = this.getChildren(id).then((response) => {
      children = response.files;
      return children;
    });

    yield doneChildren;
    if (children.length === 0) {
      return;
    }

    for (let folder of children) {
      // yield *this.listIDsGenerator(folder.id);
      yield *this.listIDsGenerator(folder.id);
    }
  }

  /**
   * Gets the children of the file denoted by id.
   *
   * @param {string} id The id of a Google Drive file or folder.
   * @return {Promise} Contains the results of the query.
   */
  getChildren(id) {
    return exponentialBackoff(() => {
      return new Promise((resolve, reject) => {
        this.drive.files.list({
          q: '\'' + id + '\' in parents and trashed=false'
        }, function(err, response) {
          if (err != null) {
            reject(err);
            return;
          }

          resolve(response);
        });
      });
    }, MAX_TRIES, NAPTIME);
  }
}

module.exports = List;
