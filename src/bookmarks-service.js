const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },
  getById(knex, id) {
    return knex('bookmarks')
      .select('*')
      .where('id', id)
      .first();
  },
  insertBookmark(knex, bookmark) {
    return knex
      .insert(bookmark)
      .into('bookmarks')
      .returning('*')
      .then(res => {
        return res[0];
      });
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks')
      .where( { id } )
      .delete();
  },
  updateBookmark(knex, id, newBookmarkFields) {
    return knex('bookmarks')
      .where( { id } )
      .update(newBookmarkFields);
  }
};

module.exports = BookmarksService;