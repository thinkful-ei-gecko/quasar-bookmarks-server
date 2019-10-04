const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const { isWebUri } = require('valid-url')
const path = require('path');
const xss = require('xss');

const bookmarksRouter = express.Router();
const bodyParser = express.json();
const BookmarksService = require('./bookmarks-service');

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  description: xss(bookmark.description),
  rating: bookmark.rating
});

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => res.json(bookmarks.map(serializeBookmark)))
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, url, description, rating };

    for (const [key, value] of Object.entries(newBookmark)) {
      if (value == null) {
        logger.error(`${key} not found`);
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid URL '${url}' supplied`);
      return res
        .status(400)
        .json({
          error: { message: '\'url\' must be a valid url' }
        });
    }

    if ((typeof rating !== 'number') || (rating < 0 || rating > 5)) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res
        .status(400)
        .json({
          error: { message: '\'rating\' must be a number between 0 and 5' }
        });
    }

    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        logger.info(`Book with id ${bookmark.id} created`);
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookmarksRouter
  .route('/:id')
  .all((req, res, next) => {
    BookmarksService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${req.params.id} not found.`)
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .delete((req, res, next) => {
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        logger.info(`Bookmark with id ${req.params.id} deleted`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;