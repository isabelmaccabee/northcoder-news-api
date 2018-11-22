const knex = require('../db/connection');
const { checkParams, validateQueries } = require('./ctrl_utils/index');

exports.getAllTopics = (req, res, next) => {
  knex('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const {
    limit = 10,
    sort_ascending = 'false',
    sort_by = 'created_at',
    p = '1',
    ...rawQueries
  } = req.query;
  const offsetAmount = limit * (p - 1);
  const sortDirectionObj = { false: 'desc', true: 'asc' };
  const validatedQueries = validateQueries(
    rawQueries,
    'title',
    'votes',
    'author',
    'created_at',
    // add to
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
    .orderBy(sort_by, sortDirectionObj[sort_ascending])
    .count('comments.comment_id as comment_count')
    .limit(limit)
    .offset(offsetAmount)
    .where('topic', '=', topic)
    .then((articles) => {
      // console.log(articles);
      if (articles.length === 0) {
        return next({ status: 404, message: 'Page not found' });
      }
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.postOneTopic = (req, res, next) => knex('topics')
  .insert(req.body)
  .returning('*')
  .then((topic) => {
    res.status(201).send({ topic: topic[0] });
  })
  .catch(next);

exports.postOneArticle = (req, res, next) => {
  const newArticle = { topic: req.params.topic, ...req.body };
  return knex('articles')
    .insert(newArticle)
    .returning('*')
    .then((article) => {
      res.status(201).send({ article: article[0] });
    })
    .catch(next);
};
