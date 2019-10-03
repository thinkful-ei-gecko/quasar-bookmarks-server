function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'artstation',
      url: 'https://artstation.com',
      description: 'description 1',
      rating: 5
    },
    {
      id: 2,
      title: 'duckduckgo',
      url: 'https://duckduckgo.com',
      description: 'description 2',
      rating: 5
    },
    {
      id: 3,
      title: 'cryengine',
      url: 'https://cryengine.com',
      description: 'description 3',
      rating: 5
    },
    {
      id: 4,
      title: 'sketchfab',
      url: 'https://sketchfab.com',
      description: 'description 4',
      rating: 5
    },
  ];
}

module.exports = {
  makeBookmarksArray,
};