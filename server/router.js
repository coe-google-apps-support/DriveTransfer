const express = require('express');
const controller = require('./controller/transfer.js');

module.exports = function(app) {
  const apiRoutes = express.Router();

  //routes will go here
  apiRoutes.get('/helloworld', controller.helloworld);

  app.use('/api', apiRoutes);
}
