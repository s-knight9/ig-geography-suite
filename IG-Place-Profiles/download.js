const https = require('https');
const fs = require('fs');

const url = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Culture_Map_2023_WVS7.png";
const file = fs.createWriteStream("public/ingleswart.png");

https.get(url, (response) => {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download completed");
  });
}).on("error", (err) => {
  fs.unlink("public/ingleswart.png", () => {});
  console.log("Error: " + err.message);
});
