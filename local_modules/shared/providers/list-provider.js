const ListTask = require('../schemas/list.js');
const ListResult = require('../schemas/list_result.js');
const TaskStates = require('../task-states.js');
const UserProvider = require('./user-provider.js');
const Google = require('googleapis');

class ListProvider {

  static create(userID, folderID) {
    return ListTask.create({userID, folderID}).catch((err) => {
      console.log('Failed creating task.');
      throw err;
    });
  }

  static addResult(taskID, value) {
    value.task = taskID;
    return ListResult.create(value).catch((err) => {
      console.log(`Failed adding result for ${taskID}.`);
    });
  }

  static getDrive(taskID) {
    return ListTask.findOne({task: taskID}).then((task) => {
      return UserProvider.getUser(task.userID);
    }).then((user) => {
      let client = user.client;
      return Google.drive({version: 'v3', auth: client});
    });
  }

  static getFolder(taskID) {
    return ListTask.findOne({task: taskID}).then((task) => {
      return task.folderID;
    });
  }

  static getSpecificResult(taskID, fileID) {
    return ListResult.findOne({task: taskID, id: fileID});
  }

  static getResultCursor(taskID) {
    return ListResult.find({task: taskID}).cursor();
  }
}

module.exports = ListProvider;
