const express = require('express');
const path = require('path');
const controller = require('./controller/transfer.js');
const mainView = require('./view/main.js');
const authAPI = require('./controller/auth.js');
const Redirect = require('./controller/redirect.js');
const Task = require('./model/task.js');
const Session = require('express-session');
const logger = require('morgan');
const cors = require('cors');

const sess = {
  secret: 'fasdkh7f4qjhadf6kashfr347ajpv',
  resave: false,
  saveUninitialized: true
}

module.exports = function(app) {
  app.use(Session(sess));  // Use req.session to get and set user-specific properties.
  app.use(logger('dev'));
  app.use(cors());

  app.get('/api/list', authAPI.requireAuth, controller.list);
  app.get('/api/transfer', authAPI.requireAuth, controller.transfer);
  app.get('/api/reset', (req) => req.session.destroy);

  app.get('/view', authAPI.requireAuth, mainView.view);

  app.get('/', (req, res) => {
    console.log('redirect');
    res.redirect('/view');

  });

  app.get('/redirect', Redirect.redirect);
  app.get('/auth', authAPI.requireAuth);

  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));
}
