exports.getHomepage = (req, res, next) => {
  const endpoints = {
    '/api/topics': {
      methods: ['get', 'post'],
    },
    '/api/topics/:topic/articles': {
      methods: ['get', 'post'],
    },
    '/api/articles': {
      methods: ['get'],
    },
    '/api/articles/:article_id': {
      methods: ['get', 'patch', 'delete'],
    },
    '/api/articles/:article_id/comments': {
      methods: ['get', 'post'],
    },
    '/api/articles/:article_id/comments/:comment_id': {
      methods: ['patch', 'delete'],
    },
    '/api/users': {
      methods: ['get'],
    },
    '/api/users/:username': {
      methods: ['get'],
    },
  };
  return res.status(200).send({ endpoints });
};
