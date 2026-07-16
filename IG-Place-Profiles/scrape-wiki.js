import fetch from 'node-fetch';

fetch("https://en.wikipedia.org/wiki/Inglehart%E2%80%93Welzel_cultural_map_of_the_world", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => r.text()).then(html => {
  const urls = html.match(/https:\/\/upload\.wikimedia\.org\/[^"'\s]+/g);
  console.log(urls ? [...new Set(urls)].filter(u => u.toLowerCase().includes('culture') || u.toLowerCase().includes('map') || u.toLowerCase().includes('inglehart')) : 'None found');
});
