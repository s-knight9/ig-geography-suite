import https from 'https';

https.get('https://www.mapsofworld.com/bangladesh/bangladesh-river-map.html', (res) => {
  console.log('X-Frame-Options:', res.headers['x-frame-options']);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // try to find the image URL
    const match = data.match(/<img[^>]+src="([^">]+river-map[^">]+)"/i);
    console.log('Image URL:', match ? match[1] : 'not found');
  });
});
