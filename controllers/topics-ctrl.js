const knex = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  return knex('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  return knex('articles')
    .select(
      'articles.title',
      'articles.votes',
      'users.username as author',
      'articles.created_at',
      'articles.article_id',
      'articles.topic'
    )
    .join('users', 'users.user_id', '=', 'articles.user_id')
    .join('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id', 'users.username')
    .count('comments.comment_id as comment_count')
    .where('topic', '=', topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.postOneTopic = (req, res, next) => {
  return knex('topics')
    .insert(req.body)
    .returning('*')
    .then((topic) => {
      res.status(201).send({ topic: topic[0] });
    })
    .catch(next);
};
