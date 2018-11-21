const topicsRouter = require('express').Router();
const {
  getAllTopics,
  getArticlesByTopic,
  postOneTopic,
} = require('../controllers/topics-ctrl');
const { handle405s } = require('../errors');

topicsRouter.param('topic', (req, res, next) => {
  console.log(typeof req.params.topic);
  if (typeof req.params.topic === 'string') return next();
  next({ status: 400, message: 'Bad request' });
});

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postOneTopic)
  .all(handle405s);

topicsRouter.route('/:topic/articles').get(getArticlesByTopic);

module.exports = topicsRouter;
