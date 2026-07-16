const getPyramid = async (countryName, year) => {
  try {
    const res = await fetch(`https://populationpyramid.net/${countryName}/${year}/`);
    const text = await res.text();
    const match = text.match(/countryId\s*=\s*(\d+)/);
    if (!match) return;
    const countryId = match[1];
    
    // Now fetch the data
    const apiRes = await fetch(`https://populationpyramid.net/api/pp/${countryId}/${year}/`);
    const data = await apiRes.json();
    console.log(countryName, year, JSON.stringify(data).substring(0, 500));
  } catch (err) {
    console.error(err);
  }
};
getPyramid('bangladesh', 2026);
getPyramid('china', 2026);
getPyramid('nigeria', 2026);
getPyramid('bangladesh', 1990);
getPyramid('china', 1990);
getPyramid('nigeria', 1990);
