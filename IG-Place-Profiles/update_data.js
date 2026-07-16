import fs from 'fs';

const fetchPyramid = async (countryName, year) => {
  try {
    const res = await fetch(`https://populationpyramid.net/${countryName}/${year}/`);
    const text = await res.text();
    const match = text.match(/countryId\s*=\s*(\d+)/);
    if (!match) return null;
    const countryId = match[1];
    
    const apiRes = await fetch(`https://populationpyramid.net/api/pp/${countryId}/${year}/`);
    const data = await apiRes.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const processData = (data) => {
  const male = data.male;
  const female = data.female;
  let totalPop = 0;
  
  for (let i = 0; i < male.length; i++) {
    totalPop += male[i].v + female[i].v;
  }

  const cohorts = [];
  for (let i = 0; i < male.length; i++) {
    const age = male[i].k; // e.g. "0-4"
    const m_pct = (male[i].v / totalPop) * 100;
    const f_pct = (female[i].v / totalPop) * 100;
    
    cohorts.push(
      `          { age: "${age}", male_pct: ${m_pct.toFixed(2)}, female_pct: ${f_pct.toFixed(2)} }`
    );
  }
  
  return `[\n${cohorts.join(',\n')}\n        ]`;
};

const main = async () => {
    let tsData = fs.readFileSync('src/data.ts', 'utf8');

    const replaceCohorts = async (country, year) => {
        console.log(`Fetching ${country} ${year}...`);
        const data = await fetchPyramid(country, year);
        if(!data) return;
        const newCohortsRaw = processData(data);
        
        // Find the country block
        const countryRegex = new RegExp(`export const ${country}Profile(.*?)(?=export const |$)`, 's');
        let blockMatch = tsData.match(countryRegex);
        if(!blockMatch) { console.error("No block for", country); return; }
        let block = blockMatch[0];
        
        // Find the year block
        const yearRegex = new RegExp(`year: ${year},.*?cohorts:\\s*\\[(.*?)\\]`, 's');
        let yearMatch = block.match(yearRegex);
        if(!yearMatch) { console.error("No year for", country, year); return; }
        
        let newYearBlock = yearMatch[0].replace(/cohorts:\s*\[.*?\]/s, `cohorts: ${newCohortsRaw}`);
        block = block.replace(yearMatch[0], newYearBlock);
        
        tsData = tsData.replace(blockMatch[0], block);
        console.log(`Updated ${country} ${year}`);
    };

    await replaceCohorts('bangladesh', 1990);
    await replaceCohorts('bangladesh', 2026);
    await replaceCohorts('china', 1990);
    await replaceCohorts('china', 2026);
    await replaceCohorts('nigeria', 1990);
    await replaceCohorts('nigeria', 2026);

    fs.writeFileSync('src/data.ts', tsData);
};

main();
