const express = require('express');
const http = require('http');
const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);
const mongoose = require('mongoose');
const app = express();
const router = require('./router.js');
const socketHandler = require('./socket-handler.js');
const taskRunner = require('./task-runner.js');

require('./util/map-to-json.js');
require('./util/object-filter.js');
require('./util/object-to-map.js');

const port = 3000;
const url = 'mongodb://localhost:27017/dev';
const sess = {
  secret: 'fasdkh7f4qjhadf6kashfr347ajpv',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({url}),
}

mongoose.Promise = global.Promise;
mongoose.connect(url);

// This grabs all unhandled Promise rejections and logs them. Otherwise, you get no stacktrace.
// http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (reason) => {
    console.error(reason);
});

let session = Session(sess);

router(session, app);

const server = http.createServer(app);
socketHandler(session, server);

server.listen(port);
console.log('Your server is running on port ' + port + '.');

taskRunner();
console.log('Tasks set up.');
