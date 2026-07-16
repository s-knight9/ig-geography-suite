import fs from 'fs';

const files = fs.readdirSync('public/data').filter(f => f.endsWith('.json'));

for (const file of files) {
    const data = JSON.parse(fs.readFileSync('public/data/' + file, 'utf8'));
    const t = data.population_dynamics_time_series.find(y => y.year === 1970);
    console.log(file, t ? t.pyramid_structure.cohorts[0].male_pct : 'no 1970');
}
