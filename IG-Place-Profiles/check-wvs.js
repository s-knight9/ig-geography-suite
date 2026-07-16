import fetch from 'node-fetch';

fetch("https://www.worldvaluessurvey.org/images/Culture_Map_2023_1.png", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => console.log(r.status));
fetch("https://www.worldvaluessurvey.org/images/cultural_map_2023.png", {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}).then(r => console.log(r.status));
