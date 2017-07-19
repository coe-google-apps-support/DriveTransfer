const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransferSchema = new Schema({
  taskID: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  userID: {
    type: String,
    required: true,
  },
  newOwner: {
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
  },
  subState: {
    type: String,
    required: true,
  },
  result: {}
});

mongoose.model('transfers', TransferSchema);
