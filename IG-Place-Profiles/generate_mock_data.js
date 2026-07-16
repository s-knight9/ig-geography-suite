import fs from 'fs';
import path from 'path';

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
    trade_ledger: { main_exports: [{ commodity: "Manufactured Goods", pct_gdp: 15 }], main_imports: [{ commodity: "Machinery", pct_gdp: 10 }], top_partners_outgoing: [{ partner: "Global Market", value_usd_billions: 100 }], top_partners_incoming: [{ partner: "Global Market", value_usd_billions: 100 }] }
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

const generatePyramid = (year) => {
    const cohorts = [];
    // Just a mock bell/pyramid shape using simple math so we have data
    let popBase = 10;
    if (year > 2000) popBase = 7;
    
    for (let i = 0; i <= 20; i++) {
        // Ages 0-4 to 100+
        const ageLabel = i === 20 ? "100+" : `${i*5}-${i*5+4}`;
        // taper off as age increases
        const val = Math.max(0.1, popBase - (i * popBase / 20) + (Math.random() - 0.5));
        cohorts.push({
            age: ageLabel,
            male_pct: val / 2,
            female_pct: val / 2
        });
    }
    return cohorts;
};

const processCountry = async (c) => {
  const profile = buildBaseProfile(c);
  const allYears = Array.from({length: 71}, (_,i) => 1970 + i);
  
  for(const y of allYears) {
    profile.population_dynamics_time_series.push({
      year: y,
      pyramid_structure: { cohorts: generatePyramid(y) },
      sub_national_density_choropleth: [],
      synoptic_analysis: `Population analysis for ${y}.`
    });
  }
  
  fs.writeFileSync(`public/data/${c.slug}.json`, JSON.stringify(profile));
  console.log(`Saved ${c.name}`);
};

const main = async () => {
  if (!fs.existsSync('public/data')) fs.mkdirSync('public/data', { recursive: true });
  for (const c of countries) {
    if (fs.existsSync(`public/data/${c.slug}.json`)) {
       continue;
    }
    await processCountry(c);
  }
};

main();
