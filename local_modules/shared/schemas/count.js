const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;
const Task = require('./task.js');

const type = 'count_task';

const schema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
}, {strict: true});

schema.pre('validate', function(next){
  if (!this.task) {
    Task.create({
      userID: this.userID,
      taskType: type,
      subTask: this._id
    }).then((task) => {
      this.task = task._id;
      next();
    });
  }
  else {
    next();
  }
});

let model = mongoose.model(type, schema);

module.exports = model;
