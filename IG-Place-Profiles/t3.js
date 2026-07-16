import https from 'https';

https.get('https://populationpyramid.net/api/pp/180/1970/', r=>console.log(r.headers.location));
