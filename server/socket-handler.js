const url = require('url');
const WebSocket = require('ws');

module.exports = function(session, server) {
  const wss = new WebSocket.Server({
    verifyClient: (info, done) => {
      console.log('Parsing session from request...');
      session(info.req, {}, () => {
        console.log('Session is parsed!');

        // We can reject the connection by returning false to done(). For example,
        // reject here if user is unknown.
        // TODO reject unknown users.
        done(info.req.session.id);
      });
    },
    server
  });

  wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    console.log('User connected');
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });

    ws.send('something');

    setInterval(() => {
      ws.send('message from server');
    }, 1000);
  });
}
