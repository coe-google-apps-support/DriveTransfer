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
require('./util/object-filter.js');
require('./util/object-to-map.js');

const sess = {
  secret: Config.Session.SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({url: Config.Database.URL}),
}

// This grabs all unhandled Promise rejections and logs them. Otherwise, you get no stacktrace.
// http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (reason) => {
    console.error(reason);
});

mongoose.connect(Config.Database.URL);

let session = Session(sess);
router(session, app);

const server = http.createServer(app);
socketHandler(session, server);

server.listen(Config.Web.PORT);
console.log(`Your server is running on port ${Config.Web.PORT}.`);
