const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;

const type = 'list_result';

const schema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  webViewLink: {
    type: String,
    required: true,
  },
  iconLink: {
    type: String,
    required: true,
  },
  parents: {
    type: [String],
    required: true,
  },
  ownedByMe: {
    type: Boolean,
    required: true,
  },
}, {strict: true});

schema.index({task: 1, id: 1}, {unique: true});

let model = mongoose.model(type, schema);

module.exports = model;
