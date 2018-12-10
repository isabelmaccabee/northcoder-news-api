const knex = require('../db/connection');
const { checkArticleExists } = require('../controllers/ctrl_utils');

exports.getCommentsByArticleId = (req, res, next) => checkArticleExists(req.params.article_id)
  .then((id) => {
    if (id.length === 0) return next({ status: 404 });
    const {
      limit = 10, sort_ascending = false, sort_by = 'created_at', p = 1,
    } = req.query;
    const sortDirectionObj = { false: 'desc', true: 'asc' };
    const offsetAmount = limit * (p - 1);
    return knex('comments')
      .join('users', 'users.user_id', '=', 'comments.user_id')
      .select('comment_id', 'votes', 'users.username AS author', 'body', 'created_at')
      .where('article_id', '=', req.params.article_id)
      .limit(limit)
      .orderBy(sort_by, sortDirectionObj[sort_ascending])
      .offset(offsetAmount);
  })
  .then((comments) => {
    if (comments.length === 0) return next({ status: 404 });
    res.status(200).send({ comments });
  })
  .catch(next);

exports.postCommentByArticleId = (req, res, next) => checkArticleExists(req.params.article_id)
  .then((id) => {
    if (id.length === 0) return next({ status: 404 });
    const newComment = { article_id: req.params.article_id, ...req.body };
    return knex('comments')
      .insert(newComment)
      .returning('*');
  })
  .then((comment) => {
    res.status(201).send({ comment: comment[0] });
  })
  .catch((err) => {
    if (err.detail) {
      if (err.detail.includes('is not present in table "users".')) return next({ status: '23503-400' });
    }
    next(err);
  });

exports.updateCommentById = (req, res, next) => checkArticleExists(req.params.article_id)
  .then((id) => {
    if (id.length === 0) return Promise.reject({ status: 404 });
    return true;
  })
  .then(() => {
    const incOrDecr = req.body.inc_votes < 0 ? 'decrement' : 'increment';
    if (typeof req.body.inc_votes === 'string') return Promise.reject({ status: 400 });
    const votesInteger = req.body.inc_votes === undefined ? 0 : Math.abs(req.body.inc_votes);
    return knex('comments')
      [incOrDecr]('votes', votesInteger)
      .where('comment_id', '=', req.params.comment_id)
      .returning('*');
  })
  .then((comment) => {
    if (comment.length === 0) return next({ status: 404 });
    res.send({ comment: comment[0] });
  })
  .catch(next);

// could make into utils function

exports.deleteCommentById = (req, res, next) => checkArticleExists(req.params.article_id)
  .then((id) => {
    if (id.length === 0) return Promise.reject({ status: 404 });
    return true;
  })
  .then(() => knex('comments')
    .where('comment_id', '=', req.params.comment_id)
    .del())
  .then((deletedComment) => {
    if (deletedComment === 0) return next({ status: 404 });
    res.status(204).send({ comment: {} });
  })
  .catch(next);
