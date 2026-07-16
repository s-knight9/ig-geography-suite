import { DPPlaceProfile } from "./types";

export const bangladeshProfile: DPPlaceProfile = {
  country_metadata: {
    name: "Bangladesh",
    income_classification: "Lower-Middle Income",
    gni_per_capita_atlas: { value_usd: 2820, year: 2023 },
    hdi: { score: 0.670, rank: 129, year: 2022 }
  },
  globalisation_tab: {
    kof_index: {
      economic: { de_facto: 38.5, de_jure: 45.2 },
      social: {
        interpersonal: { de_facto: 42.1, de_jure: 48.0 },
        informational: { de_facto: 30.5, de_jure: 55.4 },
        cultural: { de_facto: 25.8, de_jure: 33.2 }
      },
      political: { de_facto: 82.4, de_jure: 79.1 }
    },
    at_kearney_framework: { status: "Emerging Hub", gci_score_or_tier: "Dhaka (No Tier-1 Global City Hub, Beta- Level)" },
    ey_index_historical: { score: 3.5, analysis: "Rapid integration post-1990 via RMG (Ready-Made Garments) sector." }
  },
  economy_tab: {
    employment_structure: { primary: 37.8, secondary: 21.4, tertiary: 35.6, quaternary: 5.2 },
    trade_ledger: {
      main_exports: [
        { commodity: "Knit & Woven Apparel", pct_gdp: 83.5 },
        { commodity: "Footwear", pct_gdp: 2.1 },
        { commodity: "Jute & Textiles", pct_gdp: 1.8 },
        { commodity: "Frozen Seafood", pct_gdp: 1.2 },
        { commodity: "Pharmaceuticals", pct_gdp: 0.9 }
      ],
      main_imports: [
        { commodity: "Cotton & Yarn", pct_gdp: 15.2 },
        { commodity: "Machinery & Equipment", pct_gdp: 12.5 },
        { commodity: "Petroleum & Refined Oils", pct_gdp: 11.0 },
        { commodity: "Iron & Steel", pct_gdp: 8.5 },
        { commodity: "Plastics", pct_gdp: 5.1 }
      ],
      top_partners_outgoing: [
        { partner: "United States", value_usd_billions: 9.8 },
        { partner: "Germany", value_usd_billions: 7.2 },
        { partner: "United Kingdom", value_usd_billions: 5.1 },
        { partner: "Spain", value_usd_billions: 3.4 },
        { partner: "France", value_usd_billions: 3.1 }
      ],
      top_partners_incoming: [
        { partner: "China", value_usd_billions: 22.1 },
        { partner: "India", value_usd_billions: 11.4 },
        { partner: "Singapore", value_usd_billions: 3.2 },
        { partner: "Indonesia", value_usd_billions: 2.8 },
        { partner: "Malaysia", value_usd_billions: 2.5 }
      ]
    }
  },
  human_geography_tab: {
    spatial_hubs: {
      epz_sez_zones: [
        { name: "Chattogram EPZ", location_lat_long: "22.28, 91.78", primary_focus: "Apparel & Heavy Industries" },
        { name: "Dhaka EPZ", location_lat_long: "23.93, 90.27", primary_focus: "High-volume RMG & Footwear" },
        { name: "Mongla EPZ", location_lat_long: "22.48, 89.60", primary_focus: "Jute & Port Processing" }
      ],
      tourism_enclaves: [
        { name: "Cox's Bazar", spatial_impact: "Coastal strip development, heavy ecological degradation, enclave tourist economy." },
        { name: "Sylhet Tea Gardens", spatial_impact: "Eco-tourism interspersed with primary resource extraction landscapes." }
      ],
      core_periphery_zones: {
        core: "Dhaka-Chattogram Industrial Corridor",
        periphery: "Northern Rangpur (agriculture) & Chittagong Hill Tracts (isolated terrain)."
      }
    },
    political_economy: {
      informal_economy_pct_gdp: 40.5,
      eiu_governance_type: "Hybrid Regime",
      freedom_house_status: "Partly Free",
      corruption_perceptions_index: { score: 24, rank: 149 }
    }
  },
  prisoners_of_geography_map: {
    topographic_friction_points: [
      { feature: "Chittagong Hill Tracts", geopolitical_constraint: "Rugged terrain historically impeding deep eastward expansion into Myanmar." },
      { feature: "Ganges-Brahmaputra Delta", geopolitical_constraint: "Massive deltaic floodings causing internal displacement and infrastructural washouts." }
    ],
    hydrological_arteries: [
      { feature: "Padma & Meghna Rivers", strategic_advantage: "Dense navigable waterways facilitating low-cost bulk transport of garments to ports." },
      { feature: "Bay of Bengal", strategic_advantage: "Geostrategic maritime shelf opening to the Indian Ocean trade routes." }
    ],
    choke_points_vulnerabilities: [
      { feature: "Siliguri Corridor Proximity", impact: "Geopolitical sensitivity squeezed beneath the 'Chicken's Neck' connecting India." },
      { feature: "Coastal Cyclone Funnel", impact: "Bay of Bengal acts as a funnel for catastrophic cyclonic surges hitting the coast directly." }
    ],
    buffer_zones: [
      { region: "Sundarbans", significance: "Massive coastal mangrove acting as a natural geographic barrier to extreme weather events." }
    ]
  },
  population_dynamics_time_series: [
    {
      year: 1990,
      pyramid_structure: {
        cohorts: [
          { age: "0-4", male_pct: 7.93, female_pct: 7.63 },
          { age: "5-9", male_pct: 7.43, female_pct: 7.16 },
          { age: "10-14", male_pct: 6.42, female_pct: 6.15 },
          { age: "15-19", male_pct: 5.21, female_pct: 5.12 },
          { age: "20-24", male_pct: 4.24, female_pct: 4.24 },
          { age: "25-29", male_pct: 3.74, female_pct: 3.75 },
          { age: "30-34", male_pct: 3.30, female_pct: 3.22 },
          { age: "35-39", male_pct: 2.76, female_pct: 2.57 },
          { age: "40-44", male_pct: 2.28, female_pct: 2.04 },
          { age: "45-49", male_pct: 2.00, female_pct: 1.77 },
          { age: "50-54", male_pct: 1.64, female_pct: 1.45 },
          { age: "55-59", male_pct: 1.31, female_pct: 1.18 },
          { age: "60-64", male_pct: 1.03, female_pct: 0.94 },
          { age: "65-69", male_pct: 0.79, female_pct: 0.71 },
          { age: "70-74", male_pct: 0.56, female_pct: 0.49 },
          { age: "75-79", male_pct: 0.34, female_pct: 0.27 },
          { age: "80-84", male_pct: 0.15, female_pct: 0.10 },
          { age: "85-89", male_pct: 0.05, female_pct: 0.03 },
          { age: "90-94", male_pct: 0.01, female_pct: 0.00 },
          { age: "95-99", male_pct: 0.00, female_pct: 0.00 },
          { age: "100+", male_pct: 0.00, female_pct: 0.00 }
        ]
      },
      sub_national_density_choropleth: [
        { admin_1_region_name: "Dhaka", density_per_km2: 1050 },
        { admin_1_region_name: "Chattogram", density_per_km2: 600 },
        { admin_1_region_name: "Rajshahi", density_per_km2: 780 },
        { admin_1_region_name: "Khulna", density_per_km2: 550 },
        { admin_1_region_name: "Barishal", density_per_km2: 610 },
        { admin_1_region_name: "Sylhet", density_per_km2: 500 }
      ],
      synoptic_analysis: "1990 portrays a classic expansive youth-bulge pyramid in early Stage 3 of the Demographic Transition Model. High birth rates persist, resulting in a wide base. Internal migration towards Dhaka begins to accelerate."
    },
    {
      year: 2026,
      pyramid_structure: {
        cohorts: [
          { age: "0-4", male_pct: 4.85, female_pct: 4.64 },
          { age: "5-9", male_pct: 4.60, female_pct: 4.36 },
          { age: "10-14", male_pct: 4.61, female_pct: 4.26 },
          { age: "15-19", male_pct: 4.87, female_pct: 4.56 },
          { age: "20-24", male_pct: 4.45, female_pct: 4.83 },
          { age: "25-29", male_pct: 3.82, female_pct: 4.71 },
          { age: "30-34", male_pct: 3.60, female_pct: 4.31 },
          { age: "35-39", male_pct: 3.23, female_pct: 3.67 },
          { age: "40-44", male_pct: 3.33, female_pct: 3.63 },
          { age: "45-49", male_pct: 2.74, female_pct: 2.67 },
          { age: "50-54", male_pct: 2.22, female_pct: 2.29 },
          { age: "55-59", male_pct: 1.88, female_pct: 1.91 },
          { age: "60-64", male_pct: 1.58, female_pct: 1.52 },
          { age: "65-69", male_pct: 1.29, female_pct: 1.19 },
          { age: "70-74", male_pct: 0.96, female_pct: 0.96 },
          { age: "75-79", male_pct: 0.58, female_pct: 0.66 },
          { age: "80-84", male_pct: 0.34, female_pct: 0.41 },
          { age: "85-89", male_pct: 0.14, female_pct: 0.19 },
          { age: "90-94", male_pct: 0.04, female_pct: 0.07 },
          { age: "95-99", male_pct: 0.01, female_pct: 0.01 },
          { age: "100+", male_pct: 0.00, female_pct: 0.00 }
        ]
      },
      sub_national_density_choropleth: [
        { admin_1_region_name: "Dhaka", density_per_km2: 2100 },
        { admin_1_region_name: "Chattogram", density_per_km2: 950 },
        { admin_1_region_name: "Rajshahi", density_per_km2: 1050 },
        { admin_1_region_name: "Khulna", density_per_km2: 720 },
        { admin_1_region_name: "Barishal", density_per_km2: 700 },
        { admin_1_region_name: "Sylhet", density_per_km2: 850 }
      ],
      synoptic_analysis: "By 2026, the pyramid is stationary, indicating a massive demographic dividend traversing working-age cohorts (15-64). Female workforce participation has revolutionized via RMG. Spatial density has acutely concentrated in the Dhaka-Chattogram core."
    }
  ]
};

export const chinaProfile: DPPlaceProfile = {
  country_metadata: {
    name: "China",
    income_classification: "Upper-Middle Income",
    gni_per_capita_atlas: { value_usd: 12850, year: 2023 },
    hdi: { score: 0.768, rank: 79, year: 2022 }
  },
  globalisation_tab: {
    kof_index: {
      economic: { de_facto: 45.1, de_jure: 52.8 },
      social: {
        interpersonal: { de_facto: 28.4, de_jure: 35.1 },
        informational: { de_facto: 42.6, de_jure: 25.4 },
        cultural: { de_facto: 40.2, de_jure: 38.5 }
      },
      political: { de_facto: 90.2, de_jure: 88.5 }
    },
    at_kearney_framework: { status: "Global Super-Hub", gci_score_or_tier: "Beijing (Alpha+), Shanghai (Alpha+)" },
    ey_index_historical: { score: 4.8, analysis: "Massive scale-up post-2001 WTO accession, dominating global secondary sector flows." }
  },
  economy_tab: {
    employment_structure: { primary: 23.5, secondary: 28.1, tertiary: 45.4, quaternary: 3.0 },
    trade_ledger: {
      main_exports: [
        { commodity: "Broadcasting Equipment", pct_gdp: 6.2 },
        { commodity: "Computers", pct_gdp: 5.5 },
        { commodity: "Integrated Circuits", pct_gdp: 4.8 },
        { commodity: "Office Machine Parts", pct_gdp: 2.3 },
        { commodity: "Telephones", pct_gdp: 2.1 }
      ],
      main_imports: [
        { commodity: "Integrated Circuits", pct_gdp: 12.5 },
        { commodity: "Crude Petroleum", pct_gdp: 8.2 },
        { commodity: "Iron Ore", pct_gdp: 5.1 },
        { commodity: "Petroleum Gas", pct_gdp: 2.2 },
        { commodity: "Gold", pct_gdp: 1.8 }
      ],
      top_partners_outgoing: [
        { partner: "United States", value_usd_billions: 536 },
        { partner: "Hong Kong", value_usd_billions: 275 },
        { partner: "Japan", value_usd_billions: 172 },
        { partner: "South Korea", value_usd_billions: 153 },
        { partner: "Vietnam", value_usd_billions: 135 }
      ],
      top_partners_incoming: [
        { partner: "Taiwan", value_usd_billions: 213 },
        { partner: "South Korea", value_usd_billions: 172 },
        { partner: "Japan", value_usd_billions: 164 },
        { partner: "United States", value_usd_billions: 154 },
        { partner: "Australia", value_usd_billions: 135 }
      ]
    }
  },
  human_geography_tab: {
    spatial_hubs: {
      epz_sez_zones: [
        { name: "Shenzhen SEZ", location_lat_long: "22.54, 114.05", primary_focus: "Tech Hardware & Innovation" },
        { name: "Pudong New Area", location_lat_long: "31.22, 121.53", primary_focus: "Global Finance & Transnational Trade" },
        { name: "Hainan Free Trade Port", location_lat_long: "19.02, 109.84", primary_focus: "Tourism & Offshore Services" }
      ],
      tourism_enclaves: [
        { name: "Macau SAR", spatial_impact: "Casino enclave driving massive regional infrastructural links (HKZM Bridge)." }
      ],
      core_periphery_zones: {
        core: "Eastern Seaboard (Pearl & Yangtze River Deltas)",
        periphery: "Western Provinces (Xinjiang, Tibet) facing massive out-migration."
      }
    },
    political_economy: {
      informal_economy_pct_gdp: 14.2,
      eiu_governance_type: "Authoritarian",
      freedom_house_status: "Not Free",
      corruption_perceptions_index: { score: 45, rank: 66 }
    }
  },
  prisoners_of_geography_map: {
    topographic_friction_points: [
      { feature: "Tibetan Plateau", geopolitical_constraint: "Massive natural fortress blocking South Asian kinetic projection, securing water sources." }
    ],
    hydrological_arteries: [
      { feature: "Yangtze River", strategic_advantage: "Navigable deep into the interior, linking Chongqing to the global oceans." }
    ],
    choke_points_vulnerabilities: [
      { feature: "Strait of Malacca", impact: "Friction point for 80% of energy imports ('Malacca Dilemma')." }
    ],
    buffer_zones: [
      { region: "Gobi Desert", significance: "Historical buffer against Northern steppe incursions." }
    ]
  },
  population_dynamics_time_series: [
    {
      year: 1990,
      pyramid_structure: {
        cohorts: [
          { age: "0-4", male_pct: 5.77, female_pct: 5.26 },
          { age: "5-9", male_pct: 4.81, female_pct: 4.49 },
          { age: "10-14", male_pct: 4.36, female_pct: 4.11 },
          { age: "15-19", male_pct: 5.48, female_pct: 5.21 },
          { age: "20-24", male_pct: 5.67, female_pct: 5.42 },
          { age: "25-29", male_pct: 4.71, female_pct: 4.52 },
          { age: "30-34", male_pct: 3.77, female_pct: 3.64 },
          { age: "35-39", male_pct: 3.85, female_pct: 3.76 },
          { age: "40-44", male_pct: 2.82, female_pct: 2.67 },
          { age: "45-49", male_pct: 2.17, female_pct: 2.00 },
          { age: "50-54", male_pct: 2.01, female_pct: 1.84 },
          { age: "55-59", male_pct: 1.79, female_pct: 1.71 },
          { age: "60-64", male_pct: 1.41, female_pct: 1.41 },
          { age: "65-69", male_pct: 1.05, female_pct: 1.15 },
          { age: "70-74", male_pct: 0.68, female_pct: 0.85 },
          { age: "75-79", male_pct: 0.39, female_pct: 0.56 },
          { age: "80-84", male_pct: 0.16, female_pct: 0.31 },
          { age: "85-89", male_pct: 0.05, female_pct: 0.12 },
          { age: "90-94", male_pct: 0.01, female_pct: 0.03 },
          { age: "95-99", male_pct: 0.00, female_pct: 0.00 },
          { age: "100+", male_pct: 0.00, female_pct: 0.00 }
        ]
      },
      sub_national_density_choropleth: [
        { admin_1_region_name: "Guangdong", density_per_km2: 350 },
        { admin_1_region_name: "Jiangsu", density_per_km2: 600 },
        { admin_1_region_name: "Shandong", density_per_km2: 500 },
        { admin_1_region_name: "Sichuan", density_per_km2: 200 },
        { admin_1_region_name: "Xinjiang", density_per_km2: 12 },
        { admin_1_region_name: "Tibet", density_per_km2: 2 }
      ],
      synoptic_analysis: "1990 shows the early impacts of the One Child Policy with shrinking younger cohorts, while a massive working-age bulge prepares to fuel the manufacturing boom."
    },
    {
      year: 2026,
      pyramid_structure: {
        cohorts: [
          { age: "0-4", male_pct: 1.67, female_pct: 1.52 },
          { age: "5-9", male_pct: 2.77, female_pct: 2.45 },
          { age: "10-14", male_pct: 3.43, female_pct: 2.97 },
          { age: "15-19", male_pct: 3.28, female_pct: 2.80 },
          { age: "20-24", male_pct: 3.00, female_pct: 2.56 },
          { age: "25-29", male_pct: 3.10, female_pct: 2.67 },
          { age: "30-34", male_pct: 3.48, female_pct: 3.08 },
          { age: "35-39", male_pct: 4.51, female_pct: 4.13 },
          { age: "40-44", male_pct: 3.84, female_pct: 3.62 },
          { age: "45-49", male_pct: 3.34, female_pct: 3.21 },
          { age: "50-54", male_pct: 3.90, female_pct: 3.83 },
          { age: "55-59", male_pct: 4.18, female_pct: 4.21 },
          { age: "60-64", male_pct: 3.60, female_pct: 3.74 },
          { age: "65-69", male_pct: 2.22, female_pct: 2.44 },
          { age: "70-74", male_pct: 2.17, female_pct: 2.57 },
          { age: "75-79", male_pct: 1.32, female_pct: 1.68 },
          { age: "80-84", male_pct: 0.66, female_pct: 0.92 },
          { age: "85-89", male_pct: 0.30, female_pct: 0.50 },
          { age: "90-94", male_pct: 0.09, female_pct: 0.20 },
          { age: "95-99", male_pct: 0.01, female_pct: 0.04 },
          { age: "100+", male_pct: 0.00, female_pct: 0.00 }
        ]
      },
      sub_national_density_choropleth: [
        { admin_1_region_name: "Guangdong", density_per_km2: 700 }, 
        { admin_1_region_name: "Jiangsu", density_per_km2: 800 },
        { admin_1_region_name: "Shandong", density_per_km2: 650 },
        { admin_1_region_name: "Sichuan", density_per_km2: 170 }, 
        { admin_1_region_name: "Xinjiang", density_per_km2: 15 },
        { admin_1_region_name: "Tibet", density_per_km2: 3 }
      ],
      synoptic_analysis: "2026 shows a deeply constricted base (Stage 4/5 transition). The massive aging cohort (50+) signifies an impending demographic crisis and shrinking labor force."
    }
  ]
};

export const nigeriaProfile: DPPlaceProfile = {
  country_metadata: {
    name: "Nigeria",
    income_classification: "Lower-Middle Income",
    gni_per_capita_atlas: { value_usd: 2140, year: 2023 },
    hdi: { score: 0.535, rank: 163, year: 2022 }
  },
  globalisation_tab: {
    kof_index: {
      economic: { de_facto: 25.5, de_jure: 38.2 },
      social: {
        interpersonal: { de_facto: 22.1, de_jure: 29.0 },
        informational: { de_facto: 31.5, de_jure: 40.4 },
        cultural: { de_facto: 15.8, de_jure: 22.2 }
      },
      political: { de_facto: 75.4, de_jure: 69.1 }
    },
    at_kearney_framework: { status: "Regional Node", gci_score_or_tier: "Lagos (Beta+)" },
    ey_index_historical: { score: 1.8, analysis: "Heavy reliance on primary commodity exports hinders deeper structural integration." }
  },
  economy_tab: {
    employment_structure: { primary: 34.2, secondary: 11.5, tertiary: 53.1, quaternary: 1.2 },
    trade_ledger: {
      main_exports: [
        { commodity: "Crude Petroleum", pct_gdp: 75.5 },
        { commodity: "Petroleum Gas", pct_gdp: 12.1 },
        { commodity: "Cocoa Beans", pct_gdp: 1.8 },
        { commodity: "Gold", pct_gdp: 1.2 },
        { commodity: "Fertilizers", pct_gdp: 0.9 }
      ],
      main_imports: [
        { commodity: "Refined Petroleum", pct_gdp: 20.2 },
        { commodity: "Cars & Vehicles", pct_gdp: 8.5 },
        { commodity: "Wheat", pct_gdp: 5.0 },
        { commodity: "Packaged Medicaments", pct_gdp: 3.5 },
        { commodity: "Telephones", pct_gdp: 3.1 }
      ],
      top_partners_outgoing: [
        { partner: "India", value_usd_billions: 8.5 },
        { partner: "Spain", value_usd_billions: 6.2 },
        { partner: "United States", value_usd_billions: 5.1 },
        { partner: "France", value_usd_billions: 4.4 },
        { partner: "Netherlands", value_usd_billions: 4.1 }
      ],
      top_partners_incoming: [
        { partner: "China", value_usd_billions: 18.1 },
        { partner: "Netherlands", value_usd_billions: 6.4 },
        { partner: "India", value_usd_billions: 5.2 },
        { partner: "Belgium", value_usd_billions: 4.8 },
        { partner: "United States", value_usd_billions: 3.5 }
      ]
    }
  },
  human_geography_tab: {
    spatial_hubs: {
      epz_sez_zones: [
        { name: "Lekki Free Trade Zone", location_lat_long: "6.43, 3.98", primary_focus: "Petrochemicals & Logistics" },
        { name: "Ogun-Guangdong FTZ", location_lat_long: "6.83, 3.03", primary_focus: "Manufacturing & Ceramics" }
      ],
      tourism_enclaves: [
        { name: "Tinapa Resort", spatial_impact: "Under-realized enclave attempt, struggled to capture mass flows." }
      ],
      core_periphery_zones: {
        core: "Lagos-Ibadan Urban Corridor & the Niger Delta.",
        periphery: "The arid North-East, suffering from desertification & conflict."
      }
    },
    political_economy: {
      informal_economy_pct_gdp: 57.5,
      eiu_governance_type: "Hybrid Regime",
      freedom_house_status: "Partly Free",
      corruption_perceptions_index: { score: 25, rank: 145 }
    }
  },
  prisoners_of_geography_map: {
    topographic_friction_points: [
      { feature: "Sahel Transition Zone", geopolitical_constraint: "Arid encroachment pushing pastoralists south, intensifying violent farmer-herder conflicts." }
    ],
    hydrological_arteries: [
      { feature: "Niger & Benue Rivers", strategic_advantage: "The historical interior transport arteries, meeting at Lokoja." }
    ],
    choke_points_vulnerabilities: [
      { feature: "Niger Delta Creeks", impact: "Oil wealth concentrated in a highly porous, hard-to-secure environment prone to militancy." }
    ],
    buffer_zones: [
      { region: "Mandara Mountains", significance: "Rugged eastern border with Cameroon, complicating cross-border security operations." }
    ]
  },
  population_dynamics_time_series: [
    {
      year: 1990,
      pyramid_structure: {
        cohorts: [
          { age: "0-4", male_pct: 9.04, female_pct: 8.80 },
          { age: "5-9", male_pct: 7.49, female_pct: 7.34 },
          { age: "10-14", male_pct: 6.38, female_pct: 6.28 },
          { age: "15-19", male_pct: 5.10, female_pct: 5.07 },
          { age: "20-24", male_pct: 4.12, female_pct: 4.13 },
          { age: "25-29", male_pct: 3.42, female_pct: 3.52 },
          { age: "30-34", male_pct: 2.89, female_pct: 3.01 },
          { age: "35-39", male_pct: 2.42, female_pct: 2.55 },
          { age: "40-44", male_pct: 2.08, female_pct: 2.15 },
          { age: "45-49", male_pct: 1.83, female_pct: 1.86 },
          { age: "50-54", male_pct: 1.49, female_pct: 1.55 },
          { age: "55-59", male_pct: 1.18, female_pct: 1.25 },
          { age: "60-64", male_pct: 0.91, female_pct: 0.99 },
          { age: "65-69", male_pct: 0.66, female_pct: 0.74 },
          { age: "70-74", male_pct: 0.42, female_pct: 0.50 },
          { age: "75-79", male_pct: 0.22, female_pct: 0.29 },
          { age: "80-84", male_pct: 0.09, female_pct: 0.13 },
          { age: "85-89", male_pct: 0.03, female_pct: 0.04 },
          { age: "90-94", male_pct: 0.00, female_pct: 0.01 },
          { age: "95-99", male_pct: 0.00, female_pct: 0.00 },
          { age: "100+", male_pct: 0.00, female_pct: 0.00 }
        ]
      },
      sub_national_density_choropleth: [
        { admin_1_region_name: "Lagos", density_per_km2: 1200 },
        { admin_1_region_name: "Kano", density_per_km2: 250 },
        { admin_1_region_name: "Rivers", density_per_km2: 300 },
        { admin_1_region_name: "Kaduna", density_per_km2: 80 },
        { admin_1_region_name: "Borno", density_per_km2: 35 }
      ],
      synoptic_analysis: "1990 indicates an extreme Stage 2 profile with massive fertility masking high mortality rates. An incredibly young dependent population."
    },
    {
      year: 2026,
      pyramid_structure: {
        cohorts: [
          { age: "0-4", male_pct: 7.24, female_pct: 7.05 },
          { age: "5-9", male_pct: 6.64, female_pct: 6.45 },
          { age: "10-14", male_pct: 6.42, female_pct: 6.21 },
          { age: "15-19", male_pct: 5.80, female_pct: 5.58 },
          { age: "20-24", male_pct: 4.99, female_pct: 4.80 },
          { age: "25-29", male_pct: 3.96, female_pct: 3.82 },
          { age: "30-34", male_pct: 3.26, female_pct: 3.14 },
          { age: "35-39", male_pct: 2.74, female_pct: 2.66 },
          { age: "40-44", male_pct: 2.39, female_pct: 2.33 },
          { age: "45-49", male_pct: 2.03, female_pct: 1.99 },
          { age: "50-54", male_pct: 1.58, female_pct: 1.57 },
          { age: "55-59", male_pct: 1.19, female_pct: 1.20 },
          { age: "60-64", male_pct: 0.90, female_pct: 0.94 },
          { age: "65-69", male_pct: 0.65, female_pct: 0.70 },
          { age: "70-74", male_pct: 0.42, female_pct: 0.47 },
          { age: "75-79", male_pct: 0.24, female_pct: 0.27 },
          { age: "80-84", male_pct: 0.12, female_pct: 0.13 },
          { age: "85-89", male_pct: 0.04, female_pct: 0.04 },
          { age: "90-94", male_pct: 0.01, female_pct: 0.01 },
          { age: "95-99", male_pct: 0.00, female_pct: 0.00 },
          { age: "100+", male_pct: 0.00, female_pct: 0.00 }
        ]
      },
      sub_national_density_choropleth: [
        { admin_1_region_name: "Lagos", density_per_km2: 3500 },
        { admin_1_region_name: "Kano", density_per_km2: 600 },
        { admin_1_region_name: "Rivers", density_per_km2: 650 },
        { admin_1_region_name: "Kaduna", density_per_km2: 180 },
        { admin_1_region_name: "Borno", density_per_km2: 85 }
      ],
      synoptic_analysis: "Still firmly planted in early Stage 3, fertility remains exceptionally high. The youth bulge presents massive potential, but absent rapid job creation, it acts as a demographic bomb driving uncontrolled urbanization to Lagos."
    }
  ]
};
