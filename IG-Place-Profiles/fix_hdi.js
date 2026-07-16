import fs from 'fs';

const hdiData = {
  "switzerland": { score: 0.967, rank: 1, year: 2022 },
  "germany": { score: 0.950, rank: 7, year: 2022 },
  "australia": { score: 0.946, rank: 10, year: 2022 },
  "uk": { score: 0.940, rank: 15, year: 2022 },
  "south-korea": { score: 0.929, rank: 19, year: 2022 },
  "usa": { score: 0.927, rank: 20, year: 2022 },
  "poland": { score: 0.881, rank: 36, year: 2022 },
  "russia": { score: 0.821, rank: 56, year: 2022 },
  "malaysia": { score: 0.807, rank: 63, year: 2022 },
  "china": { score: 0.788, rank: 75, year: 2022 },
  "mexico": { score: 0.781, rank: 77, year: 2022 },
  "brazil": { score: 0.760, rank: 89, year: 2022 },
  "vietnam": { score: 0.726, rank: 107, year: 2022 },
  "south-africa": { score: 0.717, rank: 110, year: 2022 },
  "philippines": { score: 0.710, rank: 113, year: 2022 },
  "bangladesh": { score: 0.670, rank: 129, year: 2022 },
  "india": { score: 0.644, rank: 134, year: 2022 },
  "nigeria": { score: 0.548, rank: 161, year: 2022 },
  "sudan": { score: 0.516, rank: 170, year: 2022 },
  "ethiopia": { score: 0.492, rank: 176, year: 2022 },
  "drc": { score: 0.481, rank: 180, year: 2022 },
  "chad": { score: 0.394, rank: 189, year: 2022 },
  "niger": { score: 0.394, rank: 189, year: 2022 } 
}

const main = () => {
  for (const slug of Object.keys(hdiData)) {
    const file = `public/data/${slug}.json`;
    if (!fs.existsSync(file)) continue;
    
    const content = hdiData[slug];
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    data.country_metadata.hdi = content;
    
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Updated HDI for ${slug}`);
  }
};

main();
