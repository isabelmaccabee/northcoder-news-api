const knex = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  return knex('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(next);
};
