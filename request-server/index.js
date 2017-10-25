const Shared = require('shared');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
Shared.set(mongoose);
const Config = require('shared/config.js');
const express = require('express');
const http = require('http');
const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);
const app = express();
const router = require('./router.js');
const socketHandler = require('./socket-handler.js');

require('./util/map-to-json.js');
require('./util/object-to-map.js');

const LONG_RETRY_TIME = 10000;

/**
 * Connects Mongoose to the MongoDB.
 * @return {Promise} Resolved when the connection is successful.
 */
function connectMongoose() {
  console.info(`Attempting Mongoose connection to ${Config.Database.URL}.`);
  return mongoose.connect(Config.Database.URL, { useMongoClient: true }).then(() => {
    let session = connectSessionStore(mongoose.connection);
    router(session, app);

    const server = http.createServer(app);
    socketHandler(session, server);

    server.listen(Config.Web.PORT);
    console.log(`Your server is running on port ${Config.Web.PORT}.`);
  }, (err) => {
    setTimeout(connectMongoose, LONG_RETRY_TIME);
    return console.error(`Mongoose failed connecting to ${Config.Database.URL}.`);
  });
};

/**
 * Handles connecting the session store. This assumes you already have a connection to pass in.
 * @param {Object} connection The connection to use for the session store.
 * @return {Function} The session middleware function.
 */
function connectSessionStore(connection) {
  const sess = {
    secret: Config.Session.SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: connection}),
  };

  return Session(sess);
};

// This grabs all unhandled Promise rejections and logs them. Otherwise, you get no stacktrace.
// http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Promise rejection.');
  console.error(reason);
});

connectMongoose();
