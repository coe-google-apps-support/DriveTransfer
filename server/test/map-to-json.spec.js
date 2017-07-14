const chai = require('chai').assert;
require('../util/map-to-json.js');

describe('Map', () => {
  describe('.toJSON', () => {
    it('Convert a basic Map into an Object', () => {
      let map = new Map();
      map.set('key1', 'value1');

      let obj = map.toJSON();

      assert.isObject(obj);
      assert.property(obj, 'key1');
    });
  });
});
