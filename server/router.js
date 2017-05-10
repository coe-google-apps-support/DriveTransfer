const express = require('express');
const path = require('path');
const controller = require('./controller/transfer.js');
const mainView = require('./view/main.js');
const authAPI = require('./controller/auth.js');
const Redirect = require('./controller/redirect.js');
const Task = require('./model/task.js');
const Session = require('express-session');

const sess = {
  secret: 'fasdkh7f4qjhadf6kashfr347ajpv',
  resave: false,
  saveUninitialized: true
}

module.exports = function(app) {
  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));
  app.use(Session(sess));  // Use req.session to get and set user-specific properties.

  const apiRoutes = express.Router();
  apiRoutes.get('/list', authAPI.requireAuth, controller.list);
  apiRoutes.get('/transfer', authAPI.requireAuth, controller.transfer);
  apiRoutes.get('/reset', (req) => req.session.destroy);

  const viewRoutes = express.Router();
  viewRoutes.get('/', mainView.view);

  app.use('/api', apiRoutes);
  app.use('/view', viewRoutes);
  app.use('/redirect', Redirect.redirect);
  app.use('/auth', authAPI.requireAuth);
}
