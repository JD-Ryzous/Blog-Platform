// Central error handler: anything thrown in a route ends up here.
module.exports = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'That email is already registered.' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
};
