import https from "https";

const urls = [
  "https://www.geo-ref.net/ph/cub.htm",
  "https://www.geo-ref.net/ph/idn.htm",
  "https://www.geo-ref.net/ph/ita.htm",
];

const fetchUrl = (url: string) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const match = data.match(/m\/[a-zA-Z0-9_\-]+\.png/i);
        resolve(`${url}: ${match ? match[0] : 'not found'}`);
      });
    }).on("error", (err) => {
      resolve(`${url}: Error ${err.message}`);
    });
  });
};

Promise.all(urls.map(fetchUrl)).then((results) => {
  results.forEach((r) => console.log(r));
});
