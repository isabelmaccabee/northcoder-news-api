exports.handle400s = (err, req, res, next) => {
  const errorCodes = {
    23502: 'Malformed request, missing row info',
    400: 'Invalid data type.',
  };
  if (errorCodes[err.code] || errorCodes[err.status]) {
    if (err.status) err.code = err.status;
    return res.status(400).send({ message: errorCodes[err.code] });
  }
  next(err);
};

exports.handle404s = (err, req, res, next) => {
  const errorCodes = {
    23503: 'Page not found: key is not present in table.',
    404: 'Page not found.',
  };
  if (errorCodes[err.code] || errorCodes[err.status]) {
    if (err.status) err.code = err.status;
    return res.status(404).send({ message: errorCodes[err.code] });
  }
  next(err);
};

exports.handle405s = (req, res, next) => res.status(405).send({ message: 'Method not valid on this path' });

exports.handle422s = (err, req, res, next) => {
  const errorCodes = {
    23505: 'Unprocessable entity: key already exists.',
  };
  if (errorCodes[err.code]) {
    return res.status(422).send({ message: errorCodes[err.code] });
  }
  next(err);
};

exports.handle500s = (err, req, res, next) => {
  console.log(err);
  return res.status(500).send({ message: 'Internal server error' });
};
