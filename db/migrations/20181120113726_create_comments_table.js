exports.up = function(knex, Promise) {
  return knex.schema.createTable("comments", commentsTable => {
    commentsTable.increments("comment_id").primary();
    commentsTable
      .integer("user_id")
      .references("user_id")
      .inTable("users")
      .notNullable();
    commentsTable
      .integer("article_id")
      .references("article_id")
      .inTable("articles")
      .notNullable();
    commentsTable
      .integer("votes")
      .defaultTo(0)
      .notNullable();
    commentsTable
      .date("created_at")
      .defaultTo(knex.fn.now(6))
      .notNullable();
    commentsTable.string("body").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("comments");
};
