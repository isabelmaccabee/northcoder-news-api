const topicsRouter = require('express').Router();
const {
  getAllTopics,
  getArticlesByTopic,
  postOneTopic,
} = require('../controllers/topics-ctrl');
const { handle405s } = require('../errors');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postOneTopic)
  .all(handle405s);

topicsRouter.route('/:topic/articles').get(getArticlesByTopic);

module.exports = topicsRouter;
