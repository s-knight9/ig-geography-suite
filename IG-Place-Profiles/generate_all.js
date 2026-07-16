import fs from 'fs';

const countries = [
  { id: '840', slug: 'usa', name: "United States of America" },
  { id: '156', slug: 'china', name: "China" },
  { id: '148', slug: 'chad', name: "Chad" },
  { id: '562', slug: 'niger', name: "Niger" },
  { id: '566', slug: 'nigeria', name: "Nigeria" },
  { id: '826', slug: 'uk', name: "United Kingdom" },
  { id: '756', slug: 'switzerland', name: "Switzerland" },
  { id: '231', slug: 'ethiopia', name: "Ethiopia" },
  { id: '729', slug: 'sudan', name: "Sudan" },
  { id: '36',  slug: 'australia', name: "Australia" },
  { id: '276', slug: 'germany', name: "Germany" },
  { id: '484', slug: 'mexico', name: "Mexico" },
  { id: '76',  slug: 'brazil', name: "Brazil" },
  { id: '180', slug: 'drc', name: "Democratic Republic of the Congo" },
  { id: '50',  slug: 'bangladesh', name: "Bangladesh" }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchPyramidYear = async (countryId, year) => {
  for(let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://populationpyramid.net/api/pp/${countryId}/${year}/`);
      if (res.ok) return await res.json();
    } catch(e) {}
    await sleep(200);
  }
  return null;
};

const buildBaseProfile = (c) => ({
  country_metadata: {
    name: c.name,
    income_classification: "Variable Income",
    gni_per_capita_atlas: { value_usd: 10000, year: 2023 },
    hdi: { score: 0.700, rank: 100, year: 2022 }
  },
  globalisation_tab: {
    kof_index: {
      economic: { de_facto: 50, de_jure: 50 },
      social: { interpersonal: { de_facto: 50, de_jure: 50 }, informational: { de_facto: 50, de_jure: 50 }, cultural: { de_facto: 50, de_jure: 50 } },
      political: { de_facto: 50, de_jure: 50 }
    },
    at_kearney_framework: { status: "Integrated", gci_score_or_tier: "Beta" },
    ey_index_historical: { score: 3.5, analysis: "Steady integration into global markets." }
  },
  economy_tab: {
    employment_structure: { primary: 25, secondary: 25, tertiary: 40, quaternary: 10 },
    trade_ledger: { main_exports: [{ commodity: "Manufactured Goods", pct_gdp: 15 }], main_imports: [{ commodity: "Machinery", pct_gdp: 10 }], top_partners_outgoing: [{ partner: "Global", value_usd_billions: 100 }], top_partners_incoming: [{ partner: "Global", value_usd_billions: 100 }] }
  },
  human_geography_tab: {
    spatial_hubs: { epz_sez_zones: [{ name: "Main Hub", location_lat_long: "0, 0", primary_focus: "Mixed Use" }], tourism_enclaves: [{ name: "National Park", spatial_impact: "Eco-tourism driver" }], core_periphery_zones: { core: "Capital Region", periphery: "Rural Hinterland" } },
    political_economy: { informal_economy_pct_gdp: 30, eiu_governance_type: "Flawed Democracy", freedom_house_status: "Partly Free", corruption_perceptions_index: { score: 50, rank: 80 } }
  },
  prisoners_of_geography_map: {
    topographic_friction_points: [{ feature: "Mountain Range", geopolitical_constraint: "Limits transit" }],
    hydrological_arteries: [{ feature: "Main River", strategic_advantage: "Navigable" }],
    choke_points_vulnerabilities: [{ feature: "Border Crossing", impact: "High friction" }],
    buffer_zones: [{ region: "Borderlands", significance: "Security buffer" }]
  },
  population_dynamics_time_series: []
});

const processCountry = async (c) => {
  const profile = buildBaseProfile(c);
  // Fetch years in parallel in chunks of 10
  const allYears = Array.from({length: 71}, (_,i) => 1970 + i);
  
  for(let i=0; i<allYears.length; i+=10) {
    const chunk = allYears.slice(i, i+10);
    const results = await Promise.all(chunk.map(y => fetchPyramidYear(c.id, y).then(data => ({ year: y, data }))));
    for (const { year, data } of results) {
      if (!data) continue;
      const male = data.male;
      const female = data.female;
      let totalPop = 0;
      for (let j = 0; j < male.length; j++) totalPop += male[j].v + female[j].v;
      const cohorts = male.map((m, j) => ({
        age: m.k,
        male_pct: (m.v / totalPop) * 100,
        female_pct: (female[j].v / totalPop) * 100
      }));
      profile.population_dynamics_time_series.push({
        year,
        pyramid_structure: { cohorts },
        sub_national_density_choropleth: [{ admin_1_region_name: "Region 1", density_per_km2: 100 }],
        synoptic_analysis: `Population analysis for ${year}. Total estimated population: ${(totalPop/1000000).toFixed(1)} Million.`
      });
    }
  }
  
  // Sort by year
  profile.population_dynamics_time_series.sort((a,b) => a.year - b.year);
  fs.writeFileSync(`public/data/${c.slug}.json`, JSON.stringify(profile));
  console.log(`Saved ${c.name}`);
};

const main = async () => {
  if (!fs.existsSync('public/data')) fs.mkdirSync('public/data', { recursive: true });
  for (const c of countries) {
    if (fs.existsSync(`public/data/${c.slug}.json`)) {
       console.log(`Skipping ${c.name}, already exists...`);
       continue;
    }
    console.log(`Processing ${c.name}...`);
    await processCountry(c);
  }
};

main();
