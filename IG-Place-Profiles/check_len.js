import fs from 'fs';

let data = JSON.parse(fs.readFileSync('public/data/drc.json', 'utf8'));
console.log(data.population_dynamics_time_series.length);
