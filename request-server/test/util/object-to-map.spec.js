const assert = require('chai').assert;
require('../../util/object-to-map.js');

describe('Map', () => {
  describe('.fromObject', () => {
    let obj = {key1: 'value1', key2: 'value2'};
    let objSingle = {key2: 'value2'};

    it('Converts Objects to Maps', () => {
      assert.instanceOf(Map.fromObject({}), Map);
    });

    it('Converts empty Objects', () => {
      let emptyMap = new Map();
      assert.deepEqual(Map.fromObject({}), emptyMap);
    });

    it('Converts an Object', () => {
      let map = new Map();
      map.set('key', 'value');
      assert.deepEqual(Map.fromObject({'key': 'value'}), map);
    })
  });
});
