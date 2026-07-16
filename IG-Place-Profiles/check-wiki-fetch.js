import fetch from 'node-fetch';

fetch("https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:The_Inglehart-Welzel_World_Cultural_Map_2023.png&format=json", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)));

fetch("https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:Culture_Map_2023.png&format=json", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)));
