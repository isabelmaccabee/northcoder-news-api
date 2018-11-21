process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('/api', () => {
  beforeEach(() => {
    return connection.migrate
      .rollback()
      .then(() => {
        return connection.migrate.latest();
      })
      .then(() => {
        return connection.seed.run();
      })
      .then(() => console.log('seed success....'));
  });
  afterEach(() => {
    return connection.destroy();
  });
  describe('/topic', () => {
    it('GET / responds with 200 and all topics', () => {
      return request
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics.length).to.equal(2);
          expect(body.topics[0]).to.have.keys(['slug', 'description']);
        });
    });
  });
});
