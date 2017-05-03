
class Task {
  constructor(scopes, callback) {
    this.scopes = scopes;
    this.callback = callback;
  }

  run() {

  }

}


exports.test = function(req, res, next) {
  console.log('TEST');
  res.redirect('https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.readonly&state=%2Fapi%2Fauth&response_type=code&client_id=562619274911-86hu2j41dq1j8nklg1um26i03h03cppr.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect');
}
