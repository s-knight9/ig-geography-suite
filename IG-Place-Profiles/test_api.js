import fs from 'fs';

const fetchPyramidYear = async (countryName, year) => {
    const res = await fetch(`https://populationpyramid.net/api/pp/180/1970/`);
    const data = await res.json();
    console.log("MALE", data.male.map(m=>m.v));
    console.log("FEMALE", data.female.map(f=>f.v));
};

fetchPyramidYear();
