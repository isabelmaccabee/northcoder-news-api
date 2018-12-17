const knex = require('../../db/connection');

exports.validateQueries = (rawQuery, ...validQueries) => {
  if (validQueries.includes(rawQuery)) return rawQuery;
  return 'created_at';
};

exports.getArticlesWithCommentCounter = (userQueries) => {
  const {
    limit = 10,
    sort_ascending = 'false',
    sort_by = 'created_at',
    p = '1',
    ...rawQueries
  } = userQueries;
  const offsetAmount = limit * (p - 1);
  const sortDirectionObj = { false: 'desc', true: 'asc' };
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
    .offset(offsetAmount);
};

exports.checkArticleExists = id => knex('articles')
  .select('article_id')
  .where('article_id', '=', id);
