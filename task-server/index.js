const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Shared = require('shared').set(mongoose);
const MongoOplog = require('mongo-oplog-filter');
const Config = require('shared/config.js');
const TaskManager = require('./task-manager.js');
const TaskStates = require('shared/task-states.js');

// This grabs all unhandled Promise rejections and logs them. Otherwise, you get no stacktrace.
// http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (reason) => {
    console.error(reason);
});

mongoose.connect(Config.Database.URL);

const oplog = MongoOplog(Config.Database.OP_LOG_URL);
const filter = oplog.filter(`${Config.Database.OP_LOG_DB}.tasks`, (doc) => {
  if (doc.o.$set && doc.o.$set.state) return true;
  return false;
});

oplog.tail();

let tm = new TaskManager();
filter.on('update', (doc) => {
  let taskID = doc.o2._id;
  if (doc.o.$set.state === TaskStates.RUNNING) {
    tm.run(taskID);
  }
  else if (doc.o.$set.state === TaskStates.CANCELLED) {
    tm.cancel(taskID);
  }
});

function exitHandler(options, err) {
  if (options.cleanup) {
    console.log('clean');
    oplog.stop(() => {
      console.log('Stopped tailing the database.');
    });
  }
  if (err) {
    console.log(err.stack);
  }
  if (options.exit) {
    process.exit()
  };
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
