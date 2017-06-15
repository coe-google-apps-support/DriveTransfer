const express = require('express');
const path = require('path');
const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);
const logger = require('morgan');
const cors = require('cors');

// Routing files
const authAPI = require('./controller/auth.js');
const list = require('./controller/temp.js').list;
const Redirect = require('./controller/redirect.js');
const reset = require('./controller/reset.js').reset;
const mainView = require('./view/main.js');
const controller = require('./controller/transfer.js');

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
  app.get('/api/transfer', authAPI.requireAuth, controller.transfer);
  app.get('/api/reset', reset);

  app.get('/view', authAPI.requireAuth, mainView.view);

  app.get('/', (req, res) => {
    console.log('redirect');
    res.redirect('/view');

  });

  app.get('/redirect', Redirect.redirect);
  app.get('/auth', authAPI.requireAuth);

  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));
}
