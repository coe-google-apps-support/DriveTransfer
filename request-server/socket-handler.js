const url = require('url');
const WebSocket = require('ws');
const UserProvider = require('shared/providers/user-provider.js');
const SocketController = require('./controllers/socket-controller.js');

let socketController = new SocketController();

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

    let id = req.session.id;
    UserProvider.getUser(id).then((user) => {
      socketController.addSocket(id, ws);
      socketController.send(id, JSON.stringify({accessToken: user.tokens.access_token}));
      console.log('Send tokens here.');
    });
  });
}
