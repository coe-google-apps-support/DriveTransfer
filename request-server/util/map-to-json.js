/**
 * This utility adds a function to Maps prototype. This makes sending Maps between client and server easier.
 * There is an important limitation here: Maps can have advanced keys that Objects don't support. See here:
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
 * It really just treats Maps like Objects when it comes to serialization.
 * @return {Object} A js Object.
 */
Map.prototype.toJSON = function() {
  let obj = Object.create(null);
  for (let [k, v] of this) {
    obj[k] = v;
  }
  return obj;
};
