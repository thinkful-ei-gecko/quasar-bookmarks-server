const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const books = require('./bookStore');
const { isWebUri } = require('valid-url')

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter.get('/', (req, res, next) => {
  res.json(books)
})

bookmarksRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const bookmark = books.find(list => list.id == id);

  if(!bookmark) {
    logger.error(`Book with id ${id} not found.`)
    return res
      .status(404)
      .send('Book not found')
  }
  res.json(bookmark)
})

bookmarksRouter.post('/', bodyParser, (req, res, next) => {
  const { title, url, description, rating } = req.body;

  if(!title) {
    logger.error('Title not found')
    return res
      .status(400)
      .send('Please enter title')
  }

  if(!url) {
    logger.error('No URL supplied')
    return res
      .status(400)
      .send('Please enter a URL')
  }
  
  if(!isWebUri(url)) {
    logger.error(`Invalid URL format`)
    return res
      .status(400)
      .send('Please enter a valid URL format')
  }

  if(!description) {
    logger.error('No description found')
    return res
      .status(400)
      .send('Please enter a description')
  }

  if(!rating) {
    logger.error('No rating found')
    return res
      .status(400)
      .send('Please enter a rating')
  }

  if((typeof rating !== 'number') || (rating < 1 || rating > 5) ) {
    logger.error('Invalid rating number')
    return res
      .status(400)
      .send('Please enter number between 1 to 5')
  }

  const id = uuid();

  const bookObject = {
    id,
    title,
    url,
    description,
    rating
  }
  
  books.push(bookObject)

  logger.info(`Book with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json({id})
});

bookmarksRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  const bookmarkIndex = books.findIndex(list => list.id == id)

  if (bookmarkIndex === -1) {
    logger.error(`Book with id ${id} not found`);
    return res
      .status(404)
      .send('Id not found');
  }

  books.splice(bookmarkIndex, 1);

  logger.info(`Card with id ${id} deleted.`)

  res
    .status(204)
    .end()
})

module.exports = bookmarksRouter;