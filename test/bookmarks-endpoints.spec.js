const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', () => {
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

  describe('GET /api/bookmarks', () => {
    context('Given there are bookmarks', () => {
      const bookmarksArray = makeBookmarksArray();
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(bookmarksArray);
      });

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(200, bookmarksArray);
      });
    });

    context('Given there are no bookmarks', () => {
      it('responds with 200 and empty array', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(200, []);
      });
    });
  });

  describe('GET /api/bookmarks/:id', () => {
    context('Given there are bookmarks', () => {
      const bookmarksArray = makeBookmarksArray();
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(bookmarksArray);
      });

      it('responds with 200 and the specified bookmark', () => {
        const id = 2;
        const expectedBookmark = bookmarksArray[id - 1];
        return supertest(app)
          .get(`/api/bookmarks/${id}`)
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(200, expectedBookmark);
      });
    });

    context('Given there are no bookmarks', () => {
      it('responds with 404', () => {
        const id = 123456;
        return supertest(app)
          .get(`/api/bookmarks/${id}`)
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } });
      });
    });
  });

  describe.only('POST /api/bookmarks', () => {
    it('creates a bookmark, responding with 201 and the new bookmark', () => {
      const newBookmark = {
        title: 'new title',
        url: 'https://duckduckgo.com',
        description: 'description',
        rating: 4
      };

      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/bookmarks/${res.body.id}`)
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .expect(res.body)
        );
    });

    const reqFields = ['title', 'url', 'description', 'rating'];

    reqFields.forEach(field => {
      const newBookmark = {
        title: 'new title',
        url: 'https://duckduckgo.com',
        description: 'new description',
        rating: 3
      };

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newBookmark[field];

        return supertest(app)
          .post('/api/bookmarks')
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });

    });
  });


  describe('DELETE /api/bookmarks', () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });

      it('responds with 204 and removes the bookmark', () => {
        const idToRemove = 2;
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove);

        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/bookmarks')
              .expect(expectedBookmarks)
          );
      });
    });

    context('Given there are no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 1234567;
        return supertest(app)
          .delete(`/api/bookmarks/${bookmarkId}`)
          .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } })
      });
    });
  });


});