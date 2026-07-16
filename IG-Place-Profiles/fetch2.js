import https from 'https';
https.get('https://upload.wikimedia.org/wikipedia/commons/e/e0/Culture_Map_2023_WVS7.png', (res) => {
  console.log(res.statusCode);
});
https.get('https://www.worldvaluessurvey.org/images/Culture_Map_2023_1.png', (res) => {
        console.log('wvs', res.statusCode);
});
