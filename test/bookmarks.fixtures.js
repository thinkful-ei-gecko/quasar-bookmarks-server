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

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    url: 'https://www.hackers.com',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating: 1,
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousBookmark,
    expectedBookmark,
  }
}

  module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark
  };