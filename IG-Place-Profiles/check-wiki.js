import https from 'https';

const options = {
  hostname: 'en.wikipedia.org',
  port: 443,
  path: '/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:Culture_Map_2023_WVS7.png&format=json',
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', error => console.error(error));
req.end();
