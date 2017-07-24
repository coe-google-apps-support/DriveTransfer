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
  taskType: {
    type: String,
    required: true,
  }
}, {strict: true});

schema.index({taskID: 1, userID: 1}, {unique: true});

let model = mongoose.model('task', schema);

// For some reason, I need to FORCE mongoose to create the index.
// https://github.com/Automattic/mongoose/issues/3393
model.ensureIndexes().catch((err) => {
  console.log(err);
});

module.exports = model;
