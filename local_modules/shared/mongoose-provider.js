let Provider = {
  _mongoose: null
};

Provider.set = function(mg) {
  Provider._mongoose = mg;
}

Provider.get = function() {
  return Provider._mongoose;
}

module.exports = Provider;
