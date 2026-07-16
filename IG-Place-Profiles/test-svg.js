import https from 'https';
https.get('https://upload.wikimedia.org/wikipedia/commons/6/6a/Inglehart_Values_Map.svg', (res) => {
  console.log(res.statusCode);
});
https.get('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Inglehart_Values_Map.svg/1024px-Inglehart_Values_Map.svg.png', (res) => {
  console.log(res.statusCode);
});
