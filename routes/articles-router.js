const articlesRouter = require('express').Router({ mergeParams: true });
const {
  getAllArticles,
  getOneArticleById,
  updateArticleById,
  deleteArticleById,
} = require('../controllers/articles-ctrl');
const { handle405s } = require('../errors');
const commentsRouter = require('./comments-router');

articlesRouter.param('article_id', (req, res, next) => {
  if (/\d/.test(req.params.article_id)) return next();
  next({ status: 400 });
});

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405s);

articlesRouter.use('/:article_id/comments', commentsRouter);

articlesRouter
  .route('/:article_id')
  .get(getOneArticleById)
  .patch(updateArticleById)
  .delete(deleteArticleById)
  .all(handle405s);

module.exports = articlesRouter;
