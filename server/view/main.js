const path = require('path');

exports.view = function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '..', '..', 'client', 'src', 'static', 'index.ejs'));

  // res.status(200).json({
  //   message: "GRAWK"
  // })
}
