const express = require('express');
const path = require('path');
const controller = require('./controller/transfer.js');
const mainView = require('./view/main.js');
const authAPI = require('./controller/auth.js');
const Redirect = require('./controller/redirect.js');

module.exports = function(app) {
  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));

  const apiRoutes = express.Router();
  apiRoutes.get('/helloworld', controller.helloworld);
  apiRoutes.get('/list', controller.list);
  apiRoutes.get('/auth', authAPI.getAuthorizedClient);
  apiRoutes.get('/auth/oauth', authAPI.oauthCallback);

  const viewRoutes = express.Router();
  viewRoutes.get('/', mainView.view);
  viewRoutes.get('/redirect', Redirect.redirect);

  app.use('/api', apiRoutes);
  app.use('/', viewRoutes);
}
