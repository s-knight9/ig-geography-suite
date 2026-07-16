const https = require('https');
https.get('https://sedac.ciesin.columbia.edu/geoserver/ows?service=WMS&request=GetCapabilities', (res) => {
  console.log(res.statusCode);
});
