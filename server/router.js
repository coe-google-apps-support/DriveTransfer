const express = require('express');
const path = require('path');
const controller = require('./controller/transfer.js');
const mainView = require('./view/main.js');
const authAPI = require('./controller/auth.js');
const Redirect = require('./controller/redirect.js');
const Task = require('./model/task.js');
const Session = require('express-session');

const sess = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}

module.exports = function(app) {
  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));
  app.use(Session(sess));  // Use req.session to get and set user-specific properties.

  const apiRoutes = express.Router();
  apiRoutes.get('/list', controller.list);
  apiRoutes.get('/transfer', controller.transfer);
  apiRoutes.get('/reset', (req, res, next) => req.session.destroy);
  apiRoutes.get('/test', controller.test);


  const viewRoutes = express.Router();
  viewRoutes.get('/', mainView.view);
  viewRoutes.get('/redirect', Redirect.redirect);

  app.all('*', authAPI.requireAuth);
  app.use('/api', apiRoutes);
  app.use('/', viewRoutes);
}
