/**
* Filters out certain properties in an Object by key. See here for the original implementation:
* https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
* @param {Object} obj The Object to filter.
* @param {Function} predicate The function to use to filter. This function receives a key as a param.
* @return {Object} The newly filtered Object.
*/
Object.filterByKey = function(obj, predicate) {
  return Object.keys(obj)
  .filter(key => predicate(key))
  .reduce((res, key) => (res[key] = obj[key], res), {});
}
