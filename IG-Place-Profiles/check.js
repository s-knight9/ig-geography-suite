import fs from 'fs';

const bData = JSON.parse(fs.readFileSync('public/data/bangladesh.json', 'utf8'));
const dt = bData.population_dynamics_time_series.find(y => y.year === 1970);
let maleSum = 0;
let femaleSum = 0;
dt.pyramid_structure.cohorts.forEach(c => {
    maleSum += c.male_pct;
    femaleSum += c.female_pct;
});
console.log("Bangladesh maleSum:", maleSum);
console.log("Bangladesh femaleSum:", femaleSum);

const drcData = JSON.parse(fs.readFileSync('public/data/drc.json', 'utf8'));
const drc_dt = drcData.population_dynamics_time_series.find(y => y.year === 1970);
let drcMaleSum = 0;
let drcFemaleSum = 0;
drc_dt.pyramid_structure.cohorts.forEach(c => {
    drcMaleSum += c.male_pct;
    drcFemaleSum += c.female_pct;
});
console.log("DRC maleSum:", drcMaleSum);
console.log("DRC femaleSum:", drcFemaleSum);
