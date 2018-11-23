exports.getHomepage = (req, res, next) => {
  const endpoints = {
    '/api/topics': {
      methods: ['get', 'post'],
      description: 'asdasd',
    },
    '/api/topics/:topic/articles': {
      methods: ['get', 'post'],
      description: 'asdasd',
    },
    '/api/articles': {
      methods: ['get'],
      description: 'asdasd',
    },
    '/api/articles/:article_id': {
      methods: ['get', 'patch', 'delete'],
      description: 'asdasd',
    },
    '/api/articles/:article_id/comments': {
      methods: ['get', 'post'],
      description: 'asdasd',
    },
    '/api/articles/:article_id/comments/:comment_id': {
      methods: ['patch', 'delete'],
      description: 'asdasd',
    },
    '/api/users': {
      methods: ['get'],
      description: 'asdasd',
    },
    '/api/users/:username': {
      methods: ['get'],
      description: 'asdasd',
    },
  };
  return res.status(200).send({ endpoints });
};
