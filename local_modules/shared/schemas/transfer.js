const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;
const Task = require('./task.js');
const RequestTask = require('./transfer-request.js');
const FilterTask = require('./transfer-filter.js');

const type = 'transfer_task';

const schema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true,
  },
  requestTask: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true,
  },
  filterTask: {
    type: Schema.Types.ObjectId,
    ref: 'task',
  },
  userID: {
    type: String,
    required: true,
  },
  newOwnerEmail: {
    type: String,
    required: true,
  },
  folderID: {
    type: String,
    required: true,
  },
  result: [{
    _id: false,
    id: String,
    name: String,
    createdTime: Date,
    mimeType: String,
    webViewLink: String,
    iconLink: String,
    parents: [String],
  }]
}, {strict: true});

schema.pre('validate', function(next) {
  if (!this.task) {
    Task.create({
      userID: this.userID,
      taskType: type,
      subTask: this._id
    }).then((task) => {
      this.task = task._id;
      return RequestTask.create({
        transferTask: this.task,
        userID: this.userID,
        recipient: {
          email: this.newOwnerEmail
        }
      });
    }).then((requestTask) => {
      this.requestTask = requestTask.task;
      next();
    });
  }
  else {
    next();
  }
});

let model = mongoose.model(type, schema);

module.exports = model;
