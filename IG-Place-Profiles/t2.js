import https from 'https';

https.get('https://populationpyramid.net/api/pp/180/1970/', r=>{
    let d='';
    r.on('data', c=>d+=c);
    r.on('end', ()=>console.log(r.statusCode, d.substring(0,100)));
});
