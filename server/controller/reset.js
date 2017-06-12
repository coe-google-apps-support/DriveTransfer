exports.reset = function(req, res, next) {
  req.session.destroy();
  req.session = null;

  res.status(200).json({
    message: 'Session destroyed.'
  });
}
