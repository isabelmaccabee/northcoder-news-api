const knex = require('../db/connection');

exports.getAllUsers = (req, res, next) => knex('users')
  .select()
  .then((users) => {
    res.send({ users });
  });

exports.getUserById = (req, res, next) => knex('users')
  .select()
  .where('username', '=', req.params.username)
  .then((user) => {
    if (user.length === 0) return next({ status: 404 });
    res.status(200).send({ user: user[0] });
  })
  .catch(next);
