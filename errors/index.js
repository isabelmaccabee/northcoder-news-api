exports.handle404s = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(err.status).send({ message: 'Page not found' });
  }
  next(err);
};

exports.handle405s = (req, res, next) => {
  return res.status(405).send({ message: 'Method not valid on this path' });
};

exports.handle500s = (err, req, res, next) => {
  return res.status(500).send({ message: 'Internal server error' });
};
