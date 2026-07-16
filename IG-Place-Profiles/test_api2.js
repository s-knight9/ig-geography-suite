import fs from 'fs';

const fetchPyramidYear = async () => {
    const res = await fetch(`https://populationpyramid.net/api/pp/180/1970/`);
    const data = await res.json();
    let totalPop = 0;
    for (let j = 0; j < data.male.length; j++) totalPop += data.male[j].v + data.female[j].v;
    
    console.log("Total Pop (in thousands):", totalPop);
    console.log("Male 0-4:", data.male[0].v);
    console.log("Male 0-4 PCT:", (data.male[0].v / totalPop) * 100);
};

fetchPyramidYear();
