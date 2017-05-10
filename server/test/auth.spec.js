const expect = require('chai').expect;
const express = require('express');
const auth = require('../controller/auth.js');
const router = require('../router.js');
const http = require('../util/promisey-http.js');
const app = express();

const port = 3000;
const options = {
  host: 'localhost',
  path: '/api/auth'
}
let client;

before(() => {
  router(app);

  app.listen(port);
});

describe('Establish OAuth', function() {
  it('establishes an oauthed client', () =>  {
    /*return http.get('http://localhost:3000/api/auth').then((result) => {
      expect(result.statusCode).to.be(200);
    }, (err) => {
      throw err;
    });*/
  });
});

after(() => {
  app.close();
})
