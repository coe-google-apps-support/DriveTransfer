let Provider = {
  _mongoose: null
};

Provider.set = function(mg) {
  Provider._mongoose = mg;
}

Provider.get = function() {
  if (!this._mongoose) {
    throw new Error('Please call MongooseProvider.set to establish mongoose.');
  }
  
  return Provider._mongoose;
}

module.exports = Provider;
