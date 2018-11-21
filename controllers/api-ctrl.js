exports.getHomepage = (req, res, next) => {
  return res.status(200).send({ message: 'Welcome to the nc_knews homepage' });
};
