const usersRouter = require('express').Router();
const { getAllUsers, getUserById } = require('../controllers/users-ctrl');
const { handle405s } = require('../errors/');

usersRouter.param('user_id', (req, res, next) => {
  console.log(req.params.user_id);
  if (/[a-z]/gi.test(req.params.user_id)) return next({ status: 400 });
  next();
});

usersRouter
  .route('/')
  .get(getAllUsers)
  .all(handle405s);

usersRouter
  .route('/:user_id')
  .get(getUserById)
  .all(handle405s);

module.exports = usersRouter;
