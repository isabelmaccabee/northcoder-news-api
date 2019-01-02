# Isabel's NC-knews

Welcome to Isabel's NC-knews!

## Northcoders News API

## The back-end for a news forum to keep up-to-date with all the goings-on at NorthCoders: https://northcoder-news-api.herokuapp.com/api/

This is the back-end API for the Front-End https://northcoder-news.netlify.com. Created using Express and hosted on Heroku, this back-end server uses Knex to interact with the SQL database 'nc-knews'. This back-end has been developed through Test-Driven Development (TDD), using the Chai testing library and the Supertest testing suite (/spec/index.spec.js). The package 'body-parser' was used in conjunction with Knex and Express.

## How to use

Clone this repo from github and navigate (cd) into it. Using CLI, execute the 'npm install' command to install all the relevant dependencies. From there, you can run 'npm test' if you want to run the test suite. The URL for the hosted API is https://northcoder-news-api.herokuapp.com/api/, on which you can visit the endpoints below using the specified methods.

## Valid HTTP methods on each endpoint

- /api/topics -> get, post
- /api/topics/:topic/articles:-> get, post
- /api/articles -> get
- /api/articles/:article_id -> get, patch, delete
- /api/articles/:article_id/comments -> get, post
- /api/articles/:article_id/comments/:comment_id -> patch, delete,
- /api/users -> get
- /api/users/:username -> get
