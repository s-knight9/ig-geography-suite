import https from 'https';

const getCountryId = (countryName, year) => {
    return new Promise((resolve, reject) => {
        https.get('https://populationpyramid.net/' + countryName + '/' + year + '/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/countryId\s*=\s*(\d+)/);
                if (match) resolve(match[1]);
                else resolve(null);
            });
        }).on('error', () => resolve(null));
    });
};

(async () => {
    console.log("USA", await getCountryId('united-states-of-america', 2023));
    console.log("CHINA", await getCountryId('china', 2023));
    console.log("NIGER", await getCountryId('niger', 2023));
    console.log("NIGERIA", await getCountryId('nigeria', 2023));
    console.log("UK", await getCountryId('united-kingdom', 2023));
    console.log("SUDAN", await getCountryId('sudan', 2023));
    console.log("SWITZERLAND", await getCountryId('switzerland', 2023));
    console.log("DRC", await getCountryId('democratic-republic-of-the-congo', 2023));
})();
