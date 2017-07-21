const path = require('path');
const schemaRoot = path.resolve(__dirname, 'model', 'schemas');
const schemas = ['list.js'];

module.exports = function() {
  schemas.forEach((schemaName) => {
    let schemaPath = path.join(schemaRoot, schemaName);
    let required = require(schemaPath);
  });
}
