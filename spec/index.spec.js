process.env.NODE_ENV = 'test';
const { expect } = require('chai');
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
      expect(body.endpoints).to.be.an('object');
      expect(body.endpoints).to.have.keys(['/api/topics', '/api/topics/:topic/articles', '/api/articles', '/api/articles/:article_id', '/api/articles/:article_id/comments', '/api/articles/:article_id/comments/:comment_id', '/api/users', '/api/users/:username'])
      for (let endpoint in body.endpoints) {
        expect(body.endpoints[endpoint]).to.have.keys(['methods']);
      }
    }));
  it('GET /* responds with 404 and "Page not found" error message', () => request
    .get('/ap/')
    .expect(404)
    .then(({ body }) => {
      expect(body.message).to.equal('Page not found.');
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
    it('POST / responds with 201 and added topic with ID', () => {
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
          expect(body.message).to.equal('Unprocessable entity: key already exists.');
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
    describe('/:topics/articles', () => {
      it('GET /:topic/articles responds w 200 and all articles for specified topic, with default queries (limit = 10,sorted-by=date, order=desc,p=1)', () => {
        return request
          .get(`${topicsURL}/mitch/articles`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.an('array');
            expect(body.articles.length).to.equal(10);
            expect(body.articles[0].article_id).to.equal(1);
            expect(body.articles[9].article_id).to.equal(11);
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
      it('GET /:topic/articles with valid but non-existent query params are ignored and give 200', () => request
        .get(`${topicsURL}/mitch/articles?yellow=true`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).to.equal(10);
        }));
      it('QUERIES: GET /:topic/articles responds with 200 and correct no. of results if limit query specified', () => {
        request
          .get(`${topicsURL}/mitch/articles?limit=5`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(5);
            expect(body.articles[0].article_id).to.equal(1);
            expect(body.articles[4].article_id).to.equal(6);
          });
      });
      it('QUERIES: GET /:topic/articles responds with 200 and correct sort order if direction specified', () => {
        return request
          .get(`${topicsURL}/mitch/articles?sort_ascending=true`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].article_id).to.equal(12); 
            expect(body.articles[9].article_id).to.equal(2);
          });
      });
      it('QUERIES: GET /:topic/articles responds w 200 and correct items when page is specified', () => request
        .get(`${topicsURL}/mitch/articles?p=2`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(12);
        }));
      it('QUERIES: GET /:topic/articles responds with 200 and correct sort criteria if sort_by specified (and default is desc)', () => {
        return request
          .get(`${topicsURL}/mitch/articles?sort_by=title`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].article_id).to.equal(7); // Title = 'Z' bc default is desc
            expect(body.articles[9].article_id).to.equal(11); // Article with title = 'A' spills
          });
      });
      it('QUERIES: GET /:topic/articles responds with 200 and default if sort_by query params non-existent', () => {
        return request
          .get(`${topicsURL}/mitch/articles?sort_by=movies`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].article_id).to.equal(1);
            expect(body.articles[9].article_id).to.equal(11);
          });
      });
      it('ERROR: GET /:topic/articles with valid but non-existent param responds w 404 and error msg', () => {
        request
          .get(`${topicsURL}/horses/articles`)
          .expect(404)
          .then(({ body }) => {
            expect(body.message).to.equal('Page not found.');
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
      it('ERROR: GET /:topic/articles with wrong data type for limit or p value returns 400', () => {
        request.get(`${topicsURL}/horses/articles?limit=hello`).expect(400).then(({ body }) => {
          expect(body.message).to.equal('Invalid data type.');
        });
      });
      it('POST /:topic/articles responds with 201 and posted article with id', () => {
        const newArticle = {
          title: 'What is the meaning of life?',
          user_id: 1,
          body: 'Some say the meaning of life is 42, some say it is love. I say it is cats.',
        };
        return request
          .post(`${topicsURL}/cats/articles`)
          .send(newArticle)
          .expect(201)
          .then(({ body }) => {
            expect(body.article).to.be.an('object');
            expect(body.article).to.have.keys([
              'article_id',
              'title',
              'user_id',
              'votes',
              'created_at',
              'topic',
              'body',
            ]);
          });
      });
      it('ERROR: POST /:topic/articles with malformed body reponds with 400 and err msg', () => {
        const newArticle = {
          title: 'What is the meaning of life?',
          user_id: null,
          body: 'Some say the meaning of life is 42, some say it is love. I say it is cats.',
        };
        return request
          .post(`${topicsURL}/cats/articles`)
          .send(newArticle)
          .expect(400)
          .then(({ body }) => {
            expect(body.message).to.equal('Malformed request, missing row info');
          });
      });
      it('ERROR: POST /:topic/articles with valid but non-existent user_id in body returns 400', () => {
        const newArticle = {
          title: 'What is the meaning of life?',
          user_id: 20,
          body: 'Some say the meaning of life is 42, some say it is love. I say it is cats.',
        };
        return request
          .post(`${topicsURL}/cats/articles`)
          .send(newArticle)
          .expect(400)
          .then(({ body }) => {
            expect(body.message).to.equal('Malformed request, user does not exist');
          });
      });
      it('ERROR: POST /:topic/articles with valid but non-existent slug responds w 404 and err msg', () => {
        const newArticle = {
          title: 'What is the meaning of life?',
          user_id: 1,
          body: 'Some say the meaning of life is 42, some say it is love. I say it is dogs.',
        };
        return request
          .post(`${topicsURL}/dogs/articles`)
          .send(newArticle)
          .expect(404)
          .then(({ body }) => {
            expect(body.message).to.equal('Page not found: key is not present in table.');
          });
      });
    });
  });
  describe('/articles', () => {
    const articlesURL = '/api/articles';
    it('GET / responds with 200 and all articles with default query params', () => request
      .get(articlesURL)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.be.an('array');
        expect(body.articles.length).to.equal(10);
        expect(body.articles[3].topic).to.equal('mitch');
        expect(body.articles[4].topic).to.equal('cats');
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
        });
      }));
    it('QUERIES: GET / responds w 200 and correct no. of results if specified in limit query', () => request
      .get(`${articlesURL}?limit=15`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).to.equal(12);
      }));
    it('QUERIES: GET / responds w 200 and correct direction of results if sort_ascending specified', () => request
      .get(`${articlesURL}?sort_ascending=true`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].article_id).to.equal(12);
        expect(body.articles[9].article_id).to.equal(3);
      }));
    it('QUERIES: GET / responds w 200 and correct start value if p specified', () => request
      .get(`${articlesURL}?p=2`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].article_id).to.equal(11);
      }));
    it('QUERIES: GET /articles responds with 200 and correct sort criteria if sort_by specified (and default is desc)', () => {
      return request
        .get(`${articlesURL}?sort_by=title`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(7); // Title = 'Z' bc default is desc
          expect(body.articles[9].article_id).to.equal(8); // Articles starting w 'A' and 'Am' spill to next page
        });
    });
    it('QUERIES: GET /:topic/articles responds with 200 and default if sort_by query params non-existent', () => {
      return request
        .get(`${articlesURL}?sort_by=movies`)
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[3].topic).to.equal('mitch');
          expect(body.articles[4].topic).to.equal('cats');
        });
    });
    it('ERROR: DELETE, PATCH and PUT on / responds w 405 and "Method not valid" message', () => {
      const invalidMethods = ['delete', 'patch', 'put'];
      return Promise.all(
        invalidMethods.map(method => request[method](articlesURL)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('Method not valid on this path');
          })),
      );
    });
    describe('/:article_id', () => {
      it('GET /:article_id responds w 200 and specified article as obj', () => request
        .get(`${articlesURL}/1`)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.be.an('object');
          expect(body.article).to.have.keys([
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'body',
            'topic',
          ]);
        }));
      it('PATCH /:article_id responds w 200 and updated info (positive int)', () => {
        const increaseVotes = {
          inc_votes: 2,
        };
        return request
          .patch(`${articlesURL}/10`)
          .send(increaseVotes)
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(2);
          });
      });
      it('PATCH /:article_id responds w 200 and updated info (negative int)', () => {
        const increaseVotes = {
          inc_votes: -10,
        };
        return request
          .patch(`${articlesURL}/10`)
          .send(increaseVotes)
          .expect(200)
          .then(({ body }) => {
            expect(body.article).to.have.keys([
              'title',
              'votes',
              'user_id',
              'created_at',
              'article_id',
              'body',
              'topic',
            ]);
            expect(body.article.votes).to.equal(-10);
          });
      });
      it('ERROR: PATCH /:article_id with valid but non-existent id responds with 404 and err msg', () => {
        const increaseVotes = {
          inc_votes: 2,
        };
        return request
          .patch(`${articlesURL}/20`)
          .send(increaseVotes)
          .expect(404)
          .then(({ body }) => {
            expect(body.message).to.equal('Page not found.');
          });
      });
      it('ERROR: PATCH /:username with invalid id type responds w 400 and err msg', () => {
        const increaseVotes = {
          inc_votes: 'increase by one please',
        };
        return request.patch(`${articlesURL}/helloworld`).send(increaseVotes).expect(400).then(({ body }) => {
          expect(body.message).to.equal('Invalid data type.');
        });
      });
      it('ERROR: PATCH /:article_id with malformed body responds w 400 and err msg', () => {
        const increaseVotes = {
          inc_votes: 'increase by one please',
        };
        return request
          .patch(`${articlesURL}/10`)
          .send(increaseVotes)
          .expect(400)
          .then(({ body }) => {
            expect(body.message).to.equal('Invalid data type.');
          });
      });
      it('ERROR: GET, PATCH or DELETE /:article_id with invalid id type in params gives 400 and err msg', () => {
        const validMethods = ['get', 'patch', 'delete'];
        return Promise.all(
          validMethods.map((method) => {
            request[method](`${articlesURL}/helloworld`)
              .expect(400)
              .then(({ body }) => {
                expect(body.message).to.equal('Invalid data type.');
              });
          }),
        );
      });
      it('ERROR: GET /:article_id with valid but non-existent id in params gives 404 and err msg', () => request
        .get(`${articlesURL}/20`)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('Page not found.');
        }));
      it('ERROR: PUT and POST on /:article_id responds w 405 and err message', () => {
        const invalidMethods = ['put', 'post'];
        return Promise.all(
          invalidMethods.map(method => request[method](`${articlesURL}/1`)
            .expect(405)
            .then(({ body }) => {
              expect(body.message).to.equal('Method not valid on this path');
            })),
        );
      });
      it('DELETE /:article_id responds with 204 and empty object', () => {
        return request.delete(`${articlesURL}/1`).expect(204).then(({ body }) => {
          expect(Object.keys(body).length).to.equal(0);
        }).then(() => {
          return request.get(`${articlesURL}/1`).expect(404).then(({ body }) => {
            expect(body.message).to.equal('Page not found.');
          });
        });
      });
      it('ERROR: DELETE /:article_id on valid but non-existent responds with 404 and err msg', () => {
        return request.delete(`${articlesURL}/20`).expect(404).then(({ body }) => {
          expect(body.message).to.equal('Page not found.');
        });
      });
      it('ERROR: DELETE /:article_id with invalid id type responds w 400 and err msg', () => {
        return request.delete(`${articlesURL}/helloworld`).expect(400).then(({ body }) => {
          expect(body.message).to.equal('Invalid data type.');
        });
      });
      describe('/comments', () => {
        it('GET /:article_id/comments responds w 200 and comments for specified id, with defaults specified', () => {
          return request.get(`${articlesURL}/1/comments`).expect(200).then(({ body }) => {
            expect(body.comments).to.be.an('array');
            expect(body.comments.length).to.equal(10);
            expect(body.comments[0].comment_id).to.equal(14);
            body.comments.forEach((comment) => {
              expect(comment).to.have.keys(['comment_id', 'votes', 'author', 'body', 'created_at']);
              expect(comment.author).to.be.a('string');
            });
          });
        });
        it('QUERIES: GET /:article_id/comments responds w 200 and comments when sort_ascending specified to true', () => {
          return request.get(`${articlesURL}/1/comments?sort_ascending=true`).expect(200).then(({ body }) => {
            expect(body.comments[0].comment_id).to.equal(15);
            expect(body.comments[2].created_at).to.equal('2017-06-02T23:00:00.000Z');
          });
        });
        it('QUERIES: GET /:article_id/comments responds w 200 and correct no, of comments when limit specified', () => {
          return request.get(`${articlesURL}/1/comments?limit=13`).expect(200).then(({ body }) => {
            expect(body.comments.length).to.equal(13);
          });
        });
        it('QUERIES: GET /:article_id/comments responds with 200 and ordered by specific column when sort_by specified ', () => {
          return request.get(`${articlesURL}/1/comments?sort_by=votes`).expect(200).then(({ body }) => {
            expect(body.comments[0].comment_id).to.equal(1);
          });
        });
        it('QUERIES: GET /:article_id/comments responds with 200 and p is specified', () => {
          return request.get(`${articlesURL}/1/comments?p=2`).expect(200).then(({ body }) => {
            expect(body.comments.length).to.equal(3);
            expect(body.comments[2].comment_id).to.equal(15);
          });
        });
        it('POST /:article_id/comments responds with 201 and responds with added comment', () => {
          const newComment = {
            user_id: 1,
            body: 'What a great article, really love it',
          };
          return request.post(`${articlesURL}/1/comments`).send(newComment).expect(201).then(({ body }) => {
            expect(body.comment).to.have.keys(['user_id', 'body', 'article_id', 'comment_id', 'created_at', 'votes']);
          });
        });
        it('ERROR POST /:article_id/comments responds with 400 if user_id in body is non-existent', () => {
          const newComment = {
            user_id: 20,
            body: 'What a great article, really love it',
          };
          return request.post(`${articlesURL}/1/comments`).send(newComment).expect(400).then(({ body }) => {
            expect(body.message).to.equal('Malformed request, user does not exist');
          });
        });
        it('ERROR POST /:article_id/comments responds with 400 non-existent column is referenced in body', () => {
          const newComment = {
            helloworld: 1,
            body: 'What a great article, really love it',
          };
          return request.post(`${articlesURL}/1/comments`).send(newComment).expect(400).then(({ body }) => {
            expect(body.message).to.equal('Malformed request, column does not exist');
          });
        });
        it('ERROR: DELETE, PUT and PATCH on /:article_id/comments responds w 405 and err msg', () => {
          const invalidMethods = ['put', 'delete', 'patch'];
          return Promise.all(
            invalidMethods.map(method => request[method](`${articlesURL}/1/comments`)
              .expect(405)
              .then(({ body }) => {
                expect(body.message).to.equal('Method not valid on this path');
              })),
          );
        });
        describe('/:comment_id', () => {
          it('PATCH /:comment_id responds with 200 and updated comment', () => {
            const upByOne = {
              inc_votes: 1,
            };
            const downByOn = {
              inc_votes: -2,
            };
            return Promise.all([request.patch(`${articlesURL}/1/comments/1`).send(upByOne).expect(200).then(({ body }) => {
              expect(body.comment.votes).to.equal(101)
            }), request.patch(`${articlesURL}/1/comments/1`).send(downByOn).expect(200).then(({ body }) => {
              expect(body.comment.votes).to.equal(99)
            })]);
          });
          it('ERROR: PATCH /:comment_id responds with valid but non-existent comment id 404 and err code', () => {
            return request.patch(`${articlesURL}/1/comments/20`).expect(404).then(({ body }) => {
              expect(body.message).to.equal('Page not found.')
            }); 
          });
          it('ERROR: PATCH /:comment_id responds with invalid id gives 400 and err msg ', () => {
            return request.patch(`${articlesURL}/1/comments/helloworld`).expect(400).then(({ body }) => {
              expect(body.message).to.equal('Invalid data type.')
            }); 
          });
          it('ERROR: PATCH /:comment_id where /:article_id is valid but non-existent (comment_id is valid though) responds w 404 and err msg', () => {
            return request.patch(`${articlesURL}/20/comments/1`).expect(404).then(({ body }) => {
              expect(body.message).to.equal('Page not found.')
            }); 
          })
          it('ERROR: PATCH /:comment_id with malformed body responds w 400 and err msg', () => {
            const increaseVotes = {
              inc_votes: 'increase by one please',
            };
            return request
              .patch(`${articlesURL}/1/comments/1`)
              .send(increaseVotes)
              .expect(400)
              .then(({ body }) => {
                expect(body.message).to.equal('Invalid data type.');
              });
          });
          it('PATCH /:comment_id with no body returns 200 and unmodified comment', () => {
            return request.patch(`${articlesURL}/1/comments/1`).expect(200).then(({ body }) => {
              expect(body.comment.votes).to.equal(100);
            });
          })
          it('DELETE /:comment_id responds with 204 and empty obj', () => {
            return request.delete(`${articlesURL}/1/comments/1`).expect(204).then(({ body }) => {
              expect(Object.keys(body).length).to.equal(0);
            }).then(() => {
              return request.get(`${articlesURL}/1/comments`).expect(200).then(({ body }) => {
                body.comments.forEach((comment) => {
                  expect(comment.comment_id).to.not.equal(1)
                })
              });
            });
          });
          it('ERROR: DELETE /:comment_id with valid but non-existent id responds with 404 and err msg', () => {
            return request.delete(`${articlesURL}/1/comments/20`).expect(404).then(({ body }) => {
              expect(body.message).to.equal('Page not found.')
            })
          });
          it('ERROR: DELETE /:comment_id with valid but no-existent article_id (but existent comment_id) responds with 404 and err msg', () => {
            return request.delete(`${articlesURL}/20/comments/1`).expect(404).then(({ body }) => {
              expect(body.message).to.equal("Page not found.")
            })
          })
          it('ERROR: DELETE /:comment_id with invalid id type responds w 400 and err msg', () => {
            return request.delete(`${articlesURL}/1/comments/helloworld`).expect(400).then(({ body }) => {
              expect(body.message).to.equal('Invalid data type.');
            });
          });
          it('ERROR: GET, POST and PUT on /:comment_id responds w 405 and err msg', () => {
            const invalidMethods = ['get', 'post', 'put'];
            return Promise.all(
              invalidMethods.map(method => request[method](`${articlesURL}/1/comments/1`)
                .expect(405)
                .then(({ body }) => {
                  expect(body.message).to.equal('Method not valid on this path');
                })),
            );            
          });
        });
      });
    });
  });
  describe('/users', () => {
    const usersURL = '/api/users';
    it('GET / responds with 200 and all users', () => request
      .get(usersURL)
      .expect(200)
      .then(({ body }) => {
        expect(body.users).to.be.an('array');
        expect(body.users.length).to.equal(3);
        body.users.forEach((user) => {
          expect(user).to.have.keys(['user_id', 'username', 'avatar_url', 'name']);
        });
      }));
    it('ERROR: DELETE, PUT, PATCH and POST on / responds with 405 and err msg', () => {
      const invalidMethods = ['put', 'post', 'delete', 'patch'];
      return Promise.all(
        invalidMethods.map(method => request[method](usersURL)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('Method not valid on this path');
          })),
      );
    });
    describe('/:username', () => {
      it('GET /:username responds w 200 and specified user', () => request
        .get(`${usersURL}/rogersop`)
        .expect(200)
        .then(({ body }) => {
          expect(body.user).to.have.keys(['user_id', 'username', 'avatar_url', 'name']);
          expect(body.user.user_id).to.equal(3);
        }));
      it('ERROR: GET /:username with valid but non-existent username responds w 404 and err msg', () => request
        .get(`${usersURL}/helloworld`)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('Page not found.');
        }));
      it('ERROR: DELETE, PUT, PATCH and POST on /:username responds with 405 and err msg', () => {
        const invalidMethods = ['put', 'post', 'delete', 'patch'];
        return Promise.all(
          invalidMethods.map(method => request[method](`${usersURL}/rogersop`)
            .expect(405)
            .then(({ body }) => {
              expect(body.message).to.equal('Method not valid on this path');
            })),
        );
      });
    });
  });
});
