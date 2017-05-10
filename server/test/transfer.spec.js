const expect = require('chai').expect;
const getChildren = require('../controller/transfer.js').getChildren;

let client;

before(function() {
  // Establish a client

});

describe('GET children', function() {
  it('returns a files children', function(done) {
    this.timeout = 3000;

    let id = '0B7CO9MICkOKgSDU3eWdIaGpQU1E';
    return getChildren(client, id).then((result) => {
      // It should return an Object
      expect(result).to.be.an('object');

      // It should contain an array of files
      expect(result.files).to.be.an('array');
    });

  });
});
