const express = require('express');
const app = express();
const router = require('./router.js');

require('./util/map-to-json.js');
require('./util/object-filter.js');

var port = 3000;

// This grabs all unhandled Promise rejections and logs them. Otherwise, you get no stacktrace.
// http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (reason) => {
    console.error(reason);
});

router(app);

app.listen(port);
console.log('Your server is running on port ' + port + '.');
