const express = require('express');
const app = express();
const router = require('./router.js');

var port = 3000;

router(app);

app.listen(port);
console.log('Your server is running on port ' + port + '.');
