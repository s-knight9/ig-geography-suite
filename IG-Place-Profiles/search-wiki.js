import fetch from 'node-fetch';

fetch("https://commons.wikimedia.org/w/api.php?action=opensearch&search=Inglehart&format=json", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)));

fetch("https://commons.wikimedia.org/w/api.php?action=opensearch&search=Culture%20Map&format=json", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)));
