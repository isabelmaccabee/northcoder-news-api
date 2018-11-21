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
      });
  });
  after(() => {
    return connection.destroy();
  });
  const apiUrl = '/api';
  it('GET / responds with 200 and welcome message', () => {
    return request
      .get(apiUrl)
      .expect(200)
      .then(({ body }) => {
        expect(body.message).to.equal('Welcome to the nc_knews homepage');
      });
  });
  it('GET /* responds with 404 and "Page not found" error message', () => {
    return request
      .get('/ap/')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).to.equal('Page not found');
      });
  });
  it('DELETE, PATCH and PUT / responds with 405 and "Method not valid" error message', () => {
    const invalidMethods = ['delete', 'patch', 'put'];
    return Promise.all(
      invalidMethods.map((method) => {
        return request[method](apiUrl)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('Method not valid on this path');
          });
      })
    );
  });
  describe('/topics', () => {
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
