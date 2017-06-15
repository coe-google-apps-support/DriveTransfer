const Google = require('googleapis');
const exponentialBackoff = require('../util/exponential-backoff.js');
const unique = require('array-unique');
const flatten = require('array-flatten');
const Task = require('../model/task.js');

const MAX_TRIES = 4;
const NAPTIME = 2000;

class List extends Task {
  constructor(userID, taskID) {
    super(userID, taskID);
    this.drive = Google.drive({ version: 'v3', auth: this.client });
  }

  /**
   * This function recursively moves through a Google Drive folder given a folder id.
   * The difference between this and list is that this simply returns a Promise that contains a flat list
   * of all children. No hierarchy is implied.
   * Limitations:
   * - Drive folders can appear in multiple places. This can mean you visit the same sub-folder structures multiple times.
   * - Currently, the returned results aren't guaranteed to be unique. TODO.
   * - I've been trying to determine if you can have a loop in a Google Drive folder structure. It seems you can't, but if
   * you could, this function would get stuck in an infinite loop.
   * http://stackoverflow.com/questions/43793895/is-it-possible-for-google-drives-folder-structure-to-contain-a-loop
   *
   * @param {string} id The id of a Google Drive folder.
   * @return {Promise} A Promise that has a JSON object as the result.
   */
  listIDs(id){
    return this.getChildren(id).then((response) => {
      if (response.files.length === 0) {
        return [id];
      }

      return response.files.map((folder) => {
        return this.listIDs(folder.id);
      });

    }).then((result) => {
      return Promise.all(result);
    }).then((result) => {
      if (Array.isArray(result[0])) {
        result.push(id)
        return flatten(result);
      }

      return result;
    });
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
