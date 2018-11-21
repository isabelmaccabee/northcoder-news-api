const apiRouter = require('express').Router();
const topicRouter = require('./topics-router');
// const articlesRouter = require('./articles-router');
const { getHomepage } = require('../controllers/api-ctrl');

apiRouter.get('/', getHomepage);

apiRouter.use('/topics', topicRouter);

// apiRouter.use('/articles', articlesRouter);

module.exports = apiRouter;
