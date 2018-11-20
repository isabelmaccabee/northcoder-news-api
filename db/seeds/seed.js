const { userData, topicData, articleData } = require("../data/index");
const { formatArticleData, createReferenceObj } = require("../utils/index");

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("topics")
    .del()
    .then(() => {
      // Inserts seed entries
      return knex("topics")
        .insert(topicData)
        .returning("*");
    })
    .then(() => {
      return knex("users")
        .insert(userData)
        .returning("*");
    })
    .then(usersInTable => {
      const userRefObj = createReferenceObj(
        usersInTable,
        "username",
        "user_id"
      );
      const formattedArticles = formatArticleData(articleData, userRefObj);
      return knex("articles")
        .insert(formattedArticles)
        .returning("*");
    })
    .then(console.log);
};
