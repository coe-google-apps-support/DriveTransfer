const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;

const type = 'transfer_result';

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
}, {strict: true});

schema.index({task: 1, id: 1}, {unique: true});

let model = mongoose.model(type, schema);

module.exports = model;
