const assert = require('chai').assert;
require('../../util/object-filter.js');

describe('Object', () => {
  describe('.filterByKey', () => {
    let obj = {key1: 'value1', key2: 'value2'};
    let objSingle = {key2: 'value2'};

    it('Allows a no-op filter', () => {
      assert.deepEqual(obj, Object.filterByKey(obj, () => {return true;}));
    });

    it('Filters a single key', () => {
      let newObj = Object.filterByKey(obj, (key) => {
        if (key === 'key1') {
          return false;
        }
        return true;
      });

      assert.deepEqual(objSingle, newObj);
    });

    it('Filters all keys of an object', () => {
      assert.deepEqual({}, Object.filterByKey(obj, () => {return false;}));
    });

    it('Isn\'t added to any sub-object types', () => {
      let date = new Date();
      assert.notProperty(date, 'filterByKey');
      assert.notProperty(Date, 'filterByKey');

      let array = new Array();
      assert.notProperty(array, 'filterByKey');
      assert.notProperty(Array, 'filterByKey');

      let map = new Map();
      assert.notProperty(map, 'filterByKey');
      assert.notProperty(Map, 'filterByKey');
    });

    it('Doesn\'t modify the original Object', () => {
      let copiedObj = JSON.parse(JSON.stringify(obj));

      Object.filterByKey(obj, () => {return false;});

      assert.deepEqual(obj, {key1: 'value1', key2: 'value2'});
    });
  });
});
