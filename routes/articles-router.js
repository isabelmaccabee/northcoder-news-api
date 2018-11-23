const articlesRouter = require('express').Router();
const {
  getAllArticles,
  getOneArticleById,
  updateArticleById,
  deleteArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  updateCommentByArticleAndCommentId,
} = require('../controllers/articles-ctrl');
const { handle405s } = require('../errors');

articlesRouter.param('article_id', (req, res, next) => {
  if (/\d/.test(req.params.article_id)) return next();
  next({ status: 400 });
});

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405s);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(updateCommentByArticleAndCommentId)
  .all(handle405s);

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)
  .all(handle405s);

articlesRouter
  .route('/:article_id')
  .get(getOneArticleById)
  .patch(updateArticleById)
  .delete(deleteArticleById)
  .all(handle405s);

module.exports = articlesRouter;
