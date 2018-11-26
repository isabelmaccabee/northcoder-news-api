const commentsRouter = require('express').Router({ mergeParams: true });

const {
  updateCommentById,
  deleteCommentById,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require('../controllers/comments-ctrl');
const { handle405s } = require('../errors');

commentsRouter.param('comment_id', (req, res, next) => {
  if (/\d/.test(req.params.comment_id)) return next();
  next({ status: 400 });
});

commentsRouter
  .route('/')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)
  .all(handle405s);

commentsRouter
  .route('/:comment_id')
  .patch(updateCommentById)
  .delete(deleteCommentById)
  .all(handle405s);

module.exports = commentsRouter;
