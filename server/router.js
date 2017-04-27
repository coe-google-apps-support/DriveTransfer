const express = require('express');
const path = require('path');
const controller = require('./controller/transfer.js');
const mainView = require('./view/main.js');

module.exports = function(app) {
  app.use(express.static(path.resolve(__dirname, '..', 'client', 'src', 'static')));

  const apiRoutes = express.Router();
  apiRoutes.get('/helloworld', controller.helloworld);

  const viewRoutes = express.Router();
  viewRoutes.get('/', mainView.view);

  app.use('/api', apiRoutes);
  app.use('/', viewRoutes);
}
