const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;

const type = 'count_result';

const schema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'task',
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
}, {strict: true});

let model = mongoose.model(type, schema);

module.exports = model;
