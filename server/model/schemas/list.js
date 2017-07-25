const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const type = 'list_task';

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

schema.pre('validate', function(next){
  if (!this.task) {
    mongoose.model('task').create({
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
