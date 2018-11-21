const topicsRouter = require('express').Router();
const { getAllTopics } = require('../controllers/topics-ctrl');

topicsRouter.get('/', getAllTopics);

module.exports = topicsRouter;
