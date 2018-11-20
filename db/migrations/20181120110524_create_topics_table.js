exports.up = function(knex, Promise) {
  return knex.schema.createTable("topics", topicTable => {
    topicTable
      .string("slug")
      .unique()
      .primary()
      .notNullable();
    topicTable.string("description").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("topics");
};
