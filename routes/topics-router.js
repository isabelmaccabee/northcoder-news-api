const topicsRouter = require('express').Router();
const {
  getAllTopics,
  getArticlesByTopic,
} = require('../controllers/topics-ctrl');

topicsRouter.get('/', getAllTopics);

topicsRouter.route('/:topic/articles').get(getArticlesByTopic);

module.exports = topicsRouter;
