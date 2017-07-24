const path = require('path');
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/test';
const schemaRoot = path.resolve(__dirname, '..', 'server', 'model', 'schemas');
const schemas = ['list-test.js'];

mongoose.Promise = global.Promise;
mongoose.connect(url).then(() => {
  schemas.forEach((schemaName) => {
    let schemaPath = path.join(schemaRoot, schemas);
    let required = require(schemaPath);
    required();
  });
});
