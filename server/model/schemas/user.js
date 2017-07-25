const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  scopes: {
    type: [String],
    required: true,
  },
  tokens: {
    access_token: {
      type: String,
      required: true,
    },
    token_type: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: Number,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    }
  }
});

module.exports = mongoose.model('user', schema);
