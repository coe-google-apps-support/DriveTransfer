
const load = function(name) {
  return new Promise((resolve, reject) => {
    window.gapi.load(name, {
      callback: () => {
        resolve();
      }
    });
  });
}

export default load
