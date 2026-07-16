import fs from 'fs';
import https from 'https';

const agent = new https.Agent({ keepAlive: true });

const fetchJson = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { agent }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
                } else {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
};

const c = { id: '180', slug: 'drc' };

const main = async () => {
    console.log("Updating " + c.slug + "...");
    const path = "public/data/" + c.slug + ".json";
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    
    const years = data.population_dynamics_time_series.map(y => y.year);
    
    let concurrency = 10;
    let index = 0;
    let successCount = 0;
    let failCount = 0;
    
    const processNext = async () => {
        if (index >= years.length) return;
        const year = years[index++];
        
        let pData = await fetchJson('https://populationpyramid.net/api/pp/' + c.id + '/' + year + '/');
        if (!pData) {
            pData = await fetchJson('https://populationpyramid.net/api/pp/' + c.id + '/' + year + '/');
        }
        
        if (pData && pData.male && pData.male.length > 0) {
            successCount++;
            const node = data.population_dynamics_time_series.find(y => y.year === year);
            const male = pData.male;
            const female = pData.female;
            let totalPop = 0;
            for (let j = 0; j < male.length; j++) totalPop += male[j].v + female[j].v;
            
            node.pyramid_structure.cohorts = male.map((m, j) => ({
                age: m.k,
                male_pct: -((m.v / totalPop) * 100),
                female_pct: (female[j].v / totalPop) * 100
            }));
        } else {
            failCount++;
        }
        await processNext();
    };
    
    const workers = [];
    for (let i = 0; i < concurrency; i++) workers.push(processNext());
    await Promise.all(workers);
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log("Finished", c.slug, "Success:", successCount, "Fail:", failCount);
};

main();
