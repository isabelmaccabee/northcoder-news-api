exports.up = function (knex, Promise) {
  return knex.schema.createTable('articles', (articlesTable) => {
    articlesTable.increments('article_id').primary();
    articlesTable.string('title').notNullable();
    articlesTable.string('body', 9999).notNullable();
    articlesTable
      .integer('votes')
      .notNullable()
      .defaultTo(0);
    articlesTable
      .string('topic')
      .references('slug')
      .inTable('topics')
      .notNullable();
    articlesTable
      .integer('user_id')
      .references('user_id')
      .inTable('users')
      .notNullable();
    articlesTable.date('created_at').defaultTo(knex.fn.now(6));
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('articles');
};
