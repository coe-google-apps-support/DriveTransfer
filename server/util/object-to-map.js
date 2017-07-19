/**
 * Creates a Map from an Object.
 * @param {Object} obj The Object to convert to a Map.
 * @return {Map} A Map representation of an Object.
 */
Map.fromObject = function(obj) {
  let map = new Map();
  Object.keys(obj).forEach((key) => {
    map.set(key, obj[key]);
  });
  return map;
}
