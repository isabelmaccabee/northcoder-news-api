process.env.NODE_ENV = 'test';
const { expect, dateTime } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());
  const apiUrl = '/api';
  it('GET / responds with 200 and welcome message', () => request
    .get(apiUrl)
    .expect(200)
    .then(({ body }) => {
      expect(body.message).to.equal('Welcome to the nc_knews homepage');
    }));
  it('GET /* responds with 404 and "Page not found" error message', () => request
    .get('/ap/')
    .expect(404)
    .then(({ body }) => {
      expect(body.message).to.equal('Page not found');
    }));
  it('ERROR: DELETE, PATCH and PUT / responds with 405 and "Method not valid" error message', () => {
    const invalidMethods = ['delete', 'patch', 'put'];
    return Promise.all(
      invalidMethods.map(method => request[method](apiUrl)
        .expect(405)
        .then(({ body }) => {
          expect(body.message).to.equal('Method not valid on this path');
        })),
    );
  });
  describe('/topics', () => {
    const topicsURL = '/api/topics';
    it('GET / responds with 200 and all topics', () => request
      .get(topicsURL)
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).to.be.an('array');
        expect(body.topics.length).to.equal(2);
        body.topics.forEach((topic) => {
          expect(topic).to.have.keys(['slug', 'description']);
        });
      }));
    it('POST / responds with 201 and added article with ID', () => {
      const newTopic = {
        slug: 'dogs',
        description: 'All about dogs',
      };
      return request
        .post(topicsURL)
        .send(newTopic)
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).to.have.keys(['slug', 'description']);
        });
    });
    it('ERROR: Malformed post request (null for column values) responds with 400 and error message', () => {
      const badTopic = {
        slug: 'dogs',
      };
      return request
        .post(topicsURL)
        .send(badTopic)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).to.equal('Malformed request, missing row info');
        });
    });
    it('ERROR: Non-unique slug responds with 422 and correct error message', () => {
      const badTopic = {
        slug: 'cats',
        description: 'All about cats!',
      };
      return request
        .post(topicsURL)
        .send(badTopic)
        .expect(422)
        .then(({ body }) => {
          expect(body.message).to.equal('Unprocessable entity: non-unique slug');
        });
    });
    it('ERROR: DELETE, PATCH and PUT on / responds with 405 and "Method not valid" message ', () => {
      const invalidMethodsTopics = ['delete', 'patch', 'put'];
      return Promise.all(
        invalidMethodsTopics.map((method) => {
          request[method](topicsURL)
            .expect(405)
            .then(({ body }) => {
              expect(body.message).to.equal('Method not valid on this path');
            });
        }),
      );
    });
    it('GET /:topic/articles responds w 200 and all articles for specified topic, with default queries (limit = 10,sorted-by=date, order=desc,p=1)', () => {
      request
        .get(`${topicsURL}/mitch/articles`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an('array');
          expect(body.articles.length).to.equal(10);
          expect(body.articles[0].article_id).to.equal(1);
          expect(body.articles[9].article_id).to.equal(10);
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
            if (article.article_id === 1) {
              expect(article.comment_count).to.equal('13');
            }
            if (article.article_id === 11) {
              expect(article.comment_count).to.equal('0');
            }
          });
        });
    });
    // could return to add more expects below
    it('GET /:topic/articles with valid but non-existent query params are ignored and give 200', () => request
      .get(`${topicsURL}/mitch/articles?yellow=true`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).to.equal(10);
      }));
    // FINISH THE ONE BELOW
    // it('GET /:topc/articles with valid query to get only those by a column value succeeds with 200 ', () => request
    //   .get(`${topicsURL}/mitch/articles?author=icellusedkars`)
    //   .expect(200)
    //   .then(({ body }) => {
    //     expect(body.articles.length).to.equal(6);
    //   }));
    it('QUERIES: GET /:topic/articles responds with 200 and correct no. of results if limit query specified', () => {
      request
        .get(`${topicsURL}/mitch/articles?limit=5`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).to.equal(5);
          expect(body.articles[0].article_id).to.equal(1);
          expect(body.articles[4].article_id).to.equal(5);
        });
    });
    it('QUERIES: GET /:topic/articles responds with 200 and correct sort order if direction specified', () => {
      request
        .get(`${topicsURL}/mitch/articles?sort_ascending=true`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(11);
          expect(body.articles[9].article_id).to.equal(12);
        });
    });
    it('QUERIES: GET /:topic/articles responds w 200 and correct items when page is specified', () => request
      .get(`${topicsURL}/mitch/articles?p=2`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].article_id).to.equal(11);
      }));
    // BELOW NEEDS WORK
    it('QUERIES: GET /:topic/articles responds with 200 and correct sort criteria if sort_by specified (and default is desc)', () => {
      request
        .get(`${topicsURL}/mitch/articles?sort_by=title`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(8); // Title = 'Z' bc default is desc
          expect(body.articles[9].article_id).to.equal(10); // Article with title = 'A' spills
        });
    });
    it('ERROR: GET /:topic/articles with valid but non-existent param responds w 404 and error msg', () => {
      request
        .get(`${topicsURL}/horses/articles`)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('Page not found');
        });
    });
    it('ERROR: DELETE or PATCH on /:topic/articles return 405 and appropriate error message', () => {
      const invalidMethods = ['delete', 'patch', 'put'];
      return Promise.all(
        invalidMethods.map(method => request[method](`${topicsURL}/mitch/articles`)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('Method not valid on this path');
          })),
      );
    });
  });
});
