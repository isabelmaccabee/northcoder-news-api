const topicsRouter = require('express').Router();
const {
  getAllTopics,
  getArticlesByTopic,
  postOneTopic,
  postOneArticle,
} = require('../controllers/topics-ctrl');
const { handle405s } = require('../errors');

topicsRouter.param('topic', (req, res, next, topic) => {
  if (typeof req.params.topic === 'string') return next();
  next({ status: 400, message: 'Bad request' });
});

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postOneTopic)
  .all(handle405s);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postOneArticle)
  .all(handle405s);

module.exports = topicsRouter;
