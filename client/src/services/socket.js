let instance = null;

class Socket {
  constructor() {
    if (!instance) {
      this.ws = new WebSocket(DRIVE_TRANSFER.DT_SOCKET_URL);
      this.ws.onopen = () => {console.log('Socket opened')};
      this.ws.onmessage = this.notify.bind(this);
      this.subscribers = [];

      instance = this;
    }

    return instance;
  }

  subscribe(sub) {
    if (typeof sub.socketNotify !== 'function') {
      throw new Error('Please implement function socketNotify.');
      return;
    }

    this.subscribers.push(sub);
  }

  notify(event) {
    let value = event.data;
    try {
      let attempt = JSON.parse(value);
      value = attempt;
    }
    catch (e) {
      // This is probably just a string
    }

    for (let sub of this.subscribers) {
      sub.socketNotify(value);
    }
  }

}

export default Socket;
