class SocketController {
  constructor() {
    this.sockets = {};
  }

  /**
   * Adds a new socket.
   * @param {string} user The unique session id for a user that is establishing a socket.
   * @param {WebSocket} socket The web socket.
   */
  addSocket(user, socket) {
    this.sockets[user] = socket;
  }

  /**
   * Closes a socket for a given user.
   * TODO
   * @param {string} user The unique session id for a user.
   */
  closeSocket(user) {
    console.log('SocketController.closeSocket');
  }

  /**
   * Sends data to a client.
   * @param {string} user The unique session id for a user that is establishing a socket.
   * @param {string} data The data to send to the client;
   */
  send(user, data) {
    this.sockets[user].send(data);
  }
}

module.exports = SocketController;
