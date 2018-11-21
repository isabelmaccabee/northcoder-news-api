exports.handle400s = (err, req, res, next) => {
  if (err.code === '23502') {
    return res
      .status(400)
      .send({ message: 'Malformed request, missing row info' });
  }
  next(err);
};

exports.handle404s = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(err.status).send({ message: 'Page not found' });
  }
  next(err);
};

exports.handle405s = (req, res, next) => {
  return res.status(405).send({ message: 'Method not valid on this path' });
};

exports.handle422s = (err, req, res, next) => {
  if (err.code === '23505') {
    return res
      .status(422)
      .send({ message: 'Unprocessable entity: non-unique slug' });
  }
  next(err);
};

exports.handle500s = (err, req, res, next) => {
  return res.status(500).send({ message: 'Internal server error' });
};
