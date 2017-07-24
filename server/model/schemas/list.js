const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

schema.pre('save', function(next){
  console.log('list saved');
  if (this.isNew) {
    console.log('Do async contruction here');
  }

  next();
});

let model = mongoose.model('list_task', schema);

// For some reason, I need to FORCE mongoose to create the index.
// https://github.com/Automattic/mongoose/issues/3393
model.ensureIndexes().catch((err) => {
  console.log(err);
});

module.exports = model;
