let state = {};
let subscribers = [];

class State {
  constructor() {

  }

  /**
   * Sets the state of all subscribers. Note that this will blow away local state if it exists under the same key.
   *
   * @param {Object} newState A state Object to set to every subscriber.
   */
  setState(newState) {
    subscribers.forEach((sub) => {
      sub.setState(newState);
    });
  }

  /**
   * Subscribes the new React Component.
   *
   * @param {React.Component} newSub A React Component to set the global state of.
   */
  subscribe(newSub) {
    if (typeof newSub.setState !== 'function') {
      throw new Error('State subscribers must be React.Components.');
    }

    subscribers.push(newSub);
  }
}

export default new State();
