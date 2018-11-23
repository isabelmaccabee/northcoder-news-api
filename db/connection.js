const knex = require('knex');
const config = require('../knexfile');

const ENV = process.env.NODE_ENV || 'development';
const config =
  ENV === 'production'
    ? { client: 'pg', connection: process.env.DB_URL }
    : require('../knexfile')[ENV];

// module.exports = require('knex')(config);

const connection = knex(config);

module.exports = connection;
