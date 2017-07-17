const express = require('express');
const app = express();
const router = require('./router.js');

const http = require('http');
const url = require('url');
const WebSocket = require('ws');

require('./util/map-to-json.js');
require('./util/object-filter.js');

let port = 3000;

// This grabs all unhandled Promise rejections and logs them. Otherwise, you get no stacktrace.
// http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (reason) => {
    console.error(reason);
});

router(app);

// ws
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);
  console.log('User connected');
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

server.listen(port);
console.log('Your server is running on port ' + port + '.');
