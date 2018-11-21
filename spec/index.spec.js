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
  it('ERROR: DELETE, PATCH and PUT / responds with 405 and "Method not valid" error message', () => {
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
    const topicsURL = '/api/topics';
    it('GET / responds with 200 and all topics', () => {
      return request
        .get(topicsURL)
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics.length).to.equal(2);
          body.topics.forEach((topic) => {
            expect(topic).to.have.keys(['slug', 'description']);
          });
        });
    });
    // it('ERROR: DELETE and PATCH / responds with 405 and "Method not valid" message ', () => {
    //   const invalidMethodsTopics = ['delete', 'patch'];
    //   return Promise.all(
    //     invalidMethodsTopics.map((method) => {
    //       return request[method](topicsURL)
    //         .expect(405)
    //         .then(({ body }) => {
    //           console.log(body);
    //           expect(body.message).to.equal('Method not valid on this path');
    //         });
    //     })
    //   );
    // });
    // DO ERROR TESTING AND QUERY PARAMS TESTING HERE
    it('GET /:topic/articles responds with 200 and all articles for specified topic', () => {
      return request
        .get(`${topicsURL}/cats/articles`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an('array');
          expect(body.articles.length).to.equal(1);
          body.articles.forEach((article) => {
            expect(article).to.have.keys([
              'author',
              'title',
              'article_id',
              'votes',
              'comment_count',
              'created_at',
              'topic',
            ]);
            expect(article).to.eql({
              author: 'rogersop',
              title: 'UNCOVERED: catspiracy to bring down democracy',
              article_id: 4,
              votes: 0,
              comment_count: '2',
              created_at: '2017-12-24T00:00:00.000Z',
              topic: 'cats',
            });
          });
        });
    });
  });
});
