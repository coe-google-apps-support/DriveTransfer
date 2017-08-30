const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;
const Task = require('./task.js');
const RequestTask = require('./transfer-request.js');
const FilterTask = require('./transfer-filter.js');
const ListTask = require('./list.js');
const TaskStates = require('../task-states.js');

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
  listTask: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true,
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
      return ListTask.create({
        userID: this.userID,
        folderID: this.folderID,
      });
    }).then((listTask) => {
      this.listTask = listTask.task;
      next();
    });
  }
  else {
    next();
  }
});

schema.methods.stateChanged = function stateChanged(state) {
  if (state === TaskStates.CANCELLED) {
    return mongoose.model(type).findOne({_id: this._id})
      .populate('requestTask')
      .populate('filterTask')
      .populate('listTask')
      .exec()
      .then((doc) => {
        doc.requestTask.state = TaskStates.CANCELLED;
        doc.listTask.state = TaskStates.CANCELLED;

        if (doc.filterTask) {
          doc.filterTask.state = TaskStates.CANCELLED;
          return Promise.all([
            doc.requestTask.save(),
            doc.listTask.save(),
            doc.filterTask.save(),
          ]);
        }
        else {
          return Promise.all([doc.requestTask.save(), doc.listTask.save()]);
        }
      });
  }
};

let model = mongoose.model(type, schema);

module.exports = model;
