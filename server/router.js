const express = require('express');
const path = require('path');
const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);
const logger = require('morgan');
const cors = require('cors');

// Routing files
const authAPI = require('./controller/auth.js');
const list = require('./controller/list.js').list;
const transfer = require('./controller/transfer.js').transfer;
const task = require('./controller/task.js');
const Redirect = require('./controller/redirect.js');
const reset = require('./controller/reset.js').reset;
const mainView = require('./view/main.js');
const login = require('./controller/login.js').login;

const url = 'mongodb://localhost:27017';
const sess = {
  secret: 'fasdkh7f4qjhadf6kashfr347ajpv',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({url}),
}

module.exports = function(app) {
  app.use(Session(sess));  // Use req.session to get and set user-specific properties.
  app.use(logger('dev'));
  app.use(cors());
  app.set('view engine', 'ejs');

  app.get('/api/list', authAPI.requireAuth, list);
  app.get('/api/transfer', authAPI.requireAuth, transfer);
  app.get('/api/reset', reset);
  app.get('/api/task/run', authAPI.requireAuth, task.run);
  app.get('/api/task/pause', authAPI.requireAuth, task.pause);
  app.get('/api/task/getResult', authAPI.requireAuth, task.getResult);
  app.get('/api/task/getRecent', authAPI.requireAuth, task.getRecentWork);

  app.get('/view', authAPI.requireAuth, mainView.view);
  app.get('/login', login);

  app.get('/', (req, res) => {
    res.redirect('/view');

  });

  app.get('/redirect', Redirect.redirect);
  app.get('/auth', authAPI.requireAuth);

  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));
}
