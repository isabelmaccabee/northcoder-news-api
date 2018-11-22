const apiRouter = require('express').Router();
const topicRouter = require('./topics-router');
const articlesRouter = require('./articles-router');
const { getHomepage } = require('../controllers/api-ctrl');
const { handle405s } = require('../errors');

apiRouter
  .route('/')
  .get(getHomepage)
  .all(handle405s);

apiRouter.use('/topics', topicRouter);

apiRouter.use('/articles', articlesRouter);

module.exports = apiRouter;
