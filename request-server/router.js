const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

// Routing files
const authAPI = require('./routers/auth.js');
const list = require('./routers/list.js').list;
const count = require('./routers/counter.js').count;
const transfer = require('./routers/transfer.js');
const task = require('./routers/task.js');
const reset = require('./routers/reset.js').reset;
const mainView = require('./routers/main.js');
const login = require('./routers/login.js').login;
const transferRequest = require('./routers/transfer-request.js');

module.exports = function(session, app) {
  app.use(session);  // Use req.session to get and set user-specific properties.
  app.use(logger('dev'));
  app.use(cors());
  app.set('view engine', 'ejs');

  app.get('/api/list', authAPI.requireAuth, list);
  app.get('/api/count', authAPI.requireAuth, count);
  app.get('/api/transfer', authAPI.requireAuth, transfer.transfer);
  app.get('/api/transfer/state', authAPI.requireAuth, transfer.getSubstate);
  app.get('/api/request', authAPI.requireAuth, transferRequest);
  app.get('/api/task/run', authAPI.requireAuth, task.run);
  app.get('/api/task/cancel', authAPI.requireAuth, task.cancel);
  app.get('/view', authAPI.requireAuth, mainView.view);

  app.get('/login', login);
  app.get('/api/reset', reset);

  app.get('/', (req, res) => {
    res.redirect('/view');
  });

  app.get('/redirect', authAPI.oauthCallback);

  app.use(express.static(path.resolve(__dirname, 'static')));
}
