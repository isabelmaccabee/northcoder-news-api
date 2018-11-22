const {
  userData, topicData, articleData, commentData,
} = require('../data/index');
const { formatArticleData, createReferenceObj, formatCommentData } = require('../utils/index');

exports.seed = (knex, Promise) => knex('topics')
  .del()
  .then(() => knex('topics')
    .insert(topicData)
    .returning('*'))
  .then(() => knex('users')
    .insert(userData)
    .returning('*'))
  .then((usersInTable) => {
    const userRefObj = createReferenceObj(usersInTable, 'username', 'user_id');
    const formattedArticles = formatArticleData(articleData, userRefObj);
    return Promise.all([
      knex('articles')
        .insert(formattedArticles)
        .returning('*'),
      userRefObj,
    ]);
  })
  .then(([articlesInTable, userRefObj]) => {
    const articleRefObj = createReferenceObj(articlesInTable, 'title', 'article_id');
    const formattedComments = formatCommentData(commentData, userRefObj, articleRefObj);
    return knex('comments')
      .insert(formattedComments)
      .returning('*');
  });
