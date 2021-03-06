const knex = require('../db/connection');
const { getArticlesWithCommentCounter, validateQueries } = require('./ctrl_utils');

exports.getAllArticles = (req, res, next) => {
  const {
    limit = 10,
    sort_ascending = 'false',
    sort_by = 'created_at',
    p = '1',
    ...rawQueries
  } = req.query;
  const offsetAmount = limit * (p - 1);
  const sortDirectionObj = { false: 'desc', true: 'asc' };
  const validatedSortBy = validateQueries(
    sort_by,
    'title',
    'votes',
    'author',
    'created_at',
    'author',
  );
  return knex('articles')
    .select(
      'articles.title',
      'articles.votes',
      'users.username as author',
      'articles.created_at',
      'articles.article_id',
      'articles.topic',
    )
    .join('users', 'users.user_id', '=', 'articles.user_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id', 'users.username')
    .orderBy(validatedSortBy, sortDirectionObj[sort_ascending])
    .count('comments.comment_id as comment_count')
    .limit(limit)
    .offset(offsetAmount)
    .then((articles) => {
      if (articles.length === 0) {
        return next({ status: 404, message: 'Page not found' });
      }
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getOneArticleById = (req, res, next) => knex('articles')
  .select(
    'articles.title',
    'articles.votes',
    'users.username as author',
    'articles.created_at',
    'articles.article_id',
    'articles.topic',
    'articles.body',
  )
  .join('users', 'users.user_id', '=', 'articles.user_id')
  .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
  .groupBy('articles.article_id', 'users.username')
  .count('comments.comment_id as comment_count')
  .where('articles.article_id', '=', req.params.article_id)
  .then((article) => {
    if (article.length === 0) return next({ status: 404, message: 'Page not found' });
    res.status(200).send({ article: article[0] });
  })
  .catch(next);

exports.updateArticleById = (req, res, next) => {
  const incOrDecr = req.body.inc_votes < 0 ? 'decrement' : 'increment';
  if (typeof req.body.inc_votes === 'string') return next({ status: 400 });
  const votesInteger = Math.abs(req.body.inc_votes);
  return knex('articles')
    [incOrDecr]('votes', votesInteger)
    .where('article_id', '=', req.params.article_id)
    .returning('*')
    .then((article) => {
      if (article.length === 0) return next({ status: 404 });
      res.send({ article: article[0] });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => knex('articles')
  .where('article_id', '=', req.params.article_id)
  .del()
  .returning('*')
  .then((deletedUser) => {
    if (deletedUser.length === 0) return next({ status: 404 });
    res.status(204).send({ user: {} });
  });
