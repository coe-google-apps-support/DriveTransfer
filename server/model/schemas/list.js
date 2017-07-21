const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Task = require('../tasks/task.js');

const schema = new Schema({
  taskID: {
    type: String,
    required: true,
    unique: true,
  },
  userID: {
    type: String,
    required: true,
  },
  folderID: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    default: 'CREATED'
  },
  result: [{
    'id': String,
    'name': String,
    'createdTime': Date,
    'mimeType': String,
    'webViewLink': String,
    'iconLink': String,
    'parents': [{}],
  }]
}, {strict: true});

// schema.index({})

schema.pre('init', (doc) => {
  console.log('list created');
});

class List extends Task {
  setup() {
    console.log('Setup');
    return Promise.resolve('List setup.')
  }
}

schema.loadClass(List);
let model = mongoose.model('listTask', schema);

// For some reason, I need to FORCE mongoose to create the index.
// https://github.com/Automattic/mongoose/issues/3393
model.ensureIndexes().catch((err) => {
  console.log(err);
});
