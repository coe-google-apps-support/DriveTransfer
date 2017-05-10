const expect = require('chai').expect;
const express = require('express');
const auth = require('../controller/auth.js');
const router = require('../router.js');
const http = require('../util/promisey-http.js');
const rp = require('request-promise-native');
//const
const app = express();

const port = 8000;
const options = {
  host: 'localhost',
  path: '/api/auth'
}
let client;
let server;

before(() => {
  router(app);

  server = app.listen(port);
});

describe('Establish OAuth', function() {
  it('establishes an oauthed client', () =>  {
    return rp('http://localhost:8000').then((result) => {
      //console.log(result);
      let client = auth.getUsers().getUser(result.req.sessionID).client;
      expect(result.statusCode).to.be.equal(200);
    }, (err) => {
      throw err;
    });
  });
});

after(() => {
  server.close();
})
