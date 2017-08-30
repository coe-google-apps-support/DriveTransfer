/**
 * This model is used for managing Task states. It's worth noting that it can't be created really.
 * See the schema for list_task for an example of how to use it. All task models are created
 * indirectly. This behaviour makes it very difficult to unit test.
 */

const mongoose = require('../mongoose-provider.js').get();
const Schema = mongoose.Schema;

const schema = new Schema({
  userID: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    default: 'CREATED'
  },
  subTask: {
    type: Schema.Types.ObjectId,
    refPath: 'taskType',
    required: true
  },
  taskType: {
    type: String,
    required: true,
  }
}, {strict: true});

/**
 * This notifies subtasks of the state change, so they can react accordingly.
 */
schema.pre('save', function(next) {
  if (this.isModified('state')) {
    mongoose.model('task').findOne({_id: this._id})
      .populate('subTask')
      .exec()
      .then((doc) => {
        if (doc.subTask.stateChanged) {
          return doc.subTask.stateChanged(this.state);
        }
      }).then(() => {
        next();
      });
  }
  else {
    next();
  }
});

let model = mongoose.model('task', schema);

module.exports = model;
