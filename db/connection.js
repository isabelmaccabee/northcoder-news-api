// const knex = require('knex');

// const ENV = process.env.NODE_ENV || 'development';
// const config = ENV === 'production'
//   ? { client: 'pg', connection: process.env.DB_URL }
//   : require('../knexfile')[ENV];

// // module.exports = require('knex')(config);

// const connection = knex(config);

// module.exports = connection;

const ENV = process.env.NODE_ENV || 'development';
const config = ENV === 'production'
  ? { client: 'pg', connection: `${process.env.DB_URL}?ssl=true` }
  : require('../knexfile')[ENV];

console.log(process.env.DB_URL);

module.exports = require('knex')(config);
