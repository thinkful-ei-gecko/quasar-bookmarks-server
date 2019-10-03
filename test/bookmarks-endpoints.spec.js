const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmarks Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('clean the table', () => db('bookmarks').truncate());
  afterEach('cleanup', () => db('bookmarks').truncate());

  describe('GET /bookmarks', () => {
    context('Given there are bookmarks', () => {
      const bookmarksArray = makeBookmarksArray();
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(bookmarksArray);
      });

      it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(200, bookmarksArray);
      });
    });

    context('Given there are no bookmarks', () => {
      it('GET /bookmarks responds with 200 and empty array', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(200, []);
      })
    });
  });

  describe('GET /bookmarks/:id', () => {
    context('Given there are bookmarks', () => {
      const bookmarksArray = makeBookmarksArray();
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(bookmarksArray);
      });

      it('GET /bookmarks/:id responds with 200 and the specified bookmark', () => {
        const id = 2;
        const expectedBookmark = bookmarksArray[id - 1];
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(200, expectedBookmark);
      });
    });

    context('Given there are no bookmarks', () => {
      it('responds with 404', () => {
        const id = 123456;
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(404, {error: {message: `bookmark doesn't exist` } });
      });
    });
  });


});