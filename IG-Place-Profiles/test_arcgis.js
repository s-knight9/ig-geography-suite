const https = require('https');
https.get('https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/tile/4/5/5', (res) => {
  console.log(res.statusCode);
});
