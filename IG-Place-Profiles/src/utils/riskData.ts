export interface RiskProfile {
  climateVulnerabilityIndex: number;
  seismicVulnerabilityIndex?: number;
  geopoliticalFragility: number;
  demographicRiskIndex?: number;
  institutionalStrength: number;
  climateThreats: { title: string; description: string }[];
  geophysicalThreats: { title: string; description: string }[];
  geopoliticalThreats: { title: string; description: string }[];
  demographicThreats?: { title: string; description: string }[];
  adaptationProjects: { title: string; description: string }[];
  pioneerPossibilities: { technique: string; originContext: string; description: string }[];
}

export const getNormalizedId = (name: string): string => {
  const norm = name.toLowerCase().trim();
  if (norm.includes("china")) return "china";
  if (norm.includes("united states") || norm.includes("usa") || norm.includes("u.s.a") || norm.includes("america")) return "usa";
  if (norm.includes("turkey") || norm.includes("türk")) return "turkey";
  if (norm.includes("iceland")) return "iceland";
  if (norm.includes("panama")) return "panama";
  if (norm.includes("bangladesh")) return "bangladesh";
  if (norm.includes("egypt")) return "egypt";
  if (norm.includes("ukraine")) return "ukraine";
  if (norm.includes("drc") || norm.includes("congo")) return "drc";
  if (norm.includes("vietnam")) return "vietnam";
  if (norm.includes("philippines")) return "philippines";
  if (norm.includes("tuvalu")) return "tuvalu";
  if (norm.includes("singapore")) return "singapore";
  if (norm.includes("russia")) return "russia";
  if (norm.includes("germany")) return "germany";
  if (norm.includes("united kingdom") || norm.includes("uk")) return "uk";
  if (norm.includes("brazil")) return "brazil";
  if (norm.includes("australia")) return "australia";
  if (norm.includes("belgium")) return "belgium";
  if (norm.includes("japan")) return "japan";
  if (norm.includes("canada")) return "canada";
  if (norm.includes("ireland") || norm.includes("ire")) return "ireland";
  return norm.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
};

export const STATIC_RISK_PROFILES: Record<string, RiskProfile> = {
  china: {
    climateVulnerabilityIndex: 5.4,
    seismicVulnerabilityIndex: 6.8,
    geopoliticalFragility: 2.8,
    institutionalStrength: 8.5,
    climateThreats: [
      { title: "Coastal Megacity Inundation & Pearl River Delta Exposure", description: "Accelerating sea level rise directly threatens low-lying critical manufacturing and financial nodes in Shenzhen, Shanghai, and the Pearl River Delta, exposing trillions in physical assets to severe storm surge risks." },
      { title: "Himalayan Glacial Recession & Water Scarcity", description: "Rapid retreat of Himalayan glaciers jeopardizes the long-term perennial river flows of the Yangtze and Yellow River systems, risking domestic agricultural productivity across the North China Plain." }
    ],
    geophysicalThreats: [
      { title: "Sichuan Basin & Longmenshan Fault Rupture", description: "Extreme horizontal compression between the Indian Plate and Eurasian Plate creates severe, recurring intraplate strike-slip seismicity, prone to causing landslides and structural collapses near urbanization hubs." }
    ],
    geopoliticalThreats: [
      { title: "Taiwan Strait Containment & Semiconductor Choke-point", description: "Strategic tension in the Taiwan Strait places the global maritime flow of advanced microprocessors (from TSMC) under threat of instant disruption, threatening 60%+ of international tech supply chains." },
      { title: "South China Sea Territorial Assertion (Nine-Dash Line)", description: "Claims over the Nine-Dash Line and militarized artificial reefs create persistent naval friction with littoral Southeast Asian states (Philippines, Vietnam) over resource rights and transit safety." },
      { title: "Hong Kong Civil Integration & Autonomy Policy", description: "The direct structural transition and integration under National Security frameworks represent crucial realignments of regional financial rules and cross-border capital security." }
    ],
    adaptationProjects: [
      { title: "Sponge Cities Program Expansion", description: "Implementing permeable urban surfaces, rooftop rain gardens, and integrated wetlands across 30+ regional megacities to actively absorb, store, and clean up to 70% of stormwater run-off." },
      { title: "South-to-North Water Diversion (Nanshui Beidiao)", description: "Constructing massive central and eastern canal channels to pump billions of cubic meters of fresh water from the humid southern Yangtze basin to the dry, industrial northern plains." }
    ],
    pioneerPossibilities: [
      { technique: "Desert Solar Sand-Fixation Barriers", description: "Deploying matrix arrays of straw checkerboards and solar panels across arid dunes to stop desertification and power green micro-grids.", originContext: "Kubuqi Desert Reclamation" }
    ]
  },
  usa: {
    climateVulnerabilityIndex: 3.2,
    seismicVulnerabilityIndex: 7.5,
    geopoliticalFragility: 2.1,
    institutionalStrength: 9.0,
    climateThreats: [
      { title: "Colorado River Basin Severe Hydrological Drought", description: "Acute lack of precipitation and historic over-allocation deplete Lake Mead and Lake Powell reservoirs, endangering water provisions for 40+ million residents across Southwest states." },
      { title: "Gulf Coast Megaflood & Category 5 Hurricane Spikes", description: "Elevated sea surface temperatures fuel rapid intensification of Gulf storm systems, threatening the physical integrity of petrochemical refinery belts in Texas and Louisiana." }
    ],
    geophysicalThreats: [
      { title: "Cascadia Subduction & San Andreas Fault Strains", description: "Vast crustal strains accumulate along the slip system and subduction zones in the West Coast, exposing cities like Seattle and San Francisco to severe megathrust earthquake hazards." }
    ],
    geopoliticalThreats: [
      { title: "Taiwan Strait & South China Sea Maritime Lines", description: "Strategic reliance on unobstructed shipping through these Asian maritime gates subjects the US tech and commercial sectors to acute shipping bottleneck risks." },
      { title: "Panama Canal Trade Capacity Security", description: "Severe climate-induced freshwater shortages in the Gatun Lake system choke the transit velocity of bulk US agricultural and energy cargoes heading to Asian markets." },
      { title: "High-Tech Critical Raw Minerals Dependency", description: "Severe downstream industrial dependency on foreign sovereign processing of cobalt, lithium, and rare earth elements restricts rapid alternative energy deployment." }
    ],
    adaptationProjects: [
      { title: "Louisiana Coastal Protection & Ecosystem Master Plan", description: "A $50-billion dynamic sediment diversion strategy to rebuild barrier islands and replenish critical protective coastal marsh ecosystems in the Mississippi River delta." },
      { title: "Grid Hardening & Decentralized Power Distribution", description: "Upgrading state distribution lines, installing computerized smart breakers, and embedding local micro-grids to withstand severe climatic stressors." }
    ],
    pioneerPossibilities: [
      { technique: "Dutch-Style Room for the River Bypass Channels", description: "Transitioning away from concrete levees to wide grassland flood bypass bays that absorb historic river crests safely.", originContext: "Waal River Flood mitigation" }
    ]
  },
  canada: {
    climateVulnerabilityIndex: 3.8,
    seismicVulnerabilityIndex: 4.2,
    geopoliticalFragility: 1.5,
    institutionalStrength: 9.1,
    climateThreats: [
      { title: "Boreal Megafires & Smoke Plumes", description: "Rising temperatures and prolonged summer droughts trigger hyper-intense, widespread wildfires in the boreal forests, causing severe air quality issues, habitat destruction, and ecological shocks." },
      { title: "Permafrost Melt & Infrastructure Subsidence", description: "Accelerating warming in high-latitude regions melts sub-arctic permafrost, leading to land subsidence, road and pipeline deformation, and massive release of greenhouse gases." }
    ],
    geophysicalThreats: [
      { title: "Cascadia Subduction Zone Seismicity", description: "Accumulating tectonic strains along the offshore Cascadia Subduction Zone pose long-term risks of a high-magnitude megathrust earthquake and tsunami affecting Coastal British Columbia." }
    ],
    geopoliticalThreats: [
      { title: "US Border & Trade Vulnerabilities", description: "Extreme economic integration leaves Canada highly exposed to shifts in US protectionist trade policies, tariffs, or unilateral border controls." },
      { title: "Arctic Sovereignty & Resource Competition", description: "Warming polar regions open up the Northwest Passage and uncover resource wealth, triggering sovereignty and security competition with Russia, China, and the US." }
    ],
    adaptationProjects: [
      { title: "National Wildfire Management Strategy", description: "Implementing coordinated wildfire monitoring networks, community firebreaks (FireSmart Canada), and active forest thinning programs to mitigate megafire severity." },
      { title: "Arctic Infrastructure Stabilization", description: "Upgrading northern runways, highways, and foundations with thermosyphons and deep pile structural modifications to withstand melting permafrost soils." }
    ],
    pioneerPossibilities: [
      { technique: "Thermosyphon Passive Ground Cooling", description: "Deploying pressurized two-phase closed tubes to extract heat from sub-surface soils, keeping permafrost frozen under critical highways and structures during summer months.", originContext: "High-Latitude Arctic Engineering" }
    ]
  },
  ireland: {
    climateVulnerabilityIndex: 4.1,
    seismicVulnerabilityIndex: 1.2,
    geopoliticalFragility: 2.5,
    institutionalStrength: 8.8,
    climateThreats: [
      { title: "North Atlantic Storm Surges & Sea Level Rise", description: "Accelerating sea level rise and severe winter storm surges directly threaten low-lying coastal cities such as Dublin, Cork, and Galway, risking millions in coastal real estate and critical infrastructure." },
      { title: "Peatland Degradation & Hydrological Shocks", description: "Prolonged seasonal droughts and temperature swings degrade the island's unique peatland carbon-sink ecosystems, releasing carbon and disrupting regional water purification capacity." }
    ],
    geophysicalThreats: [
      { title: "Minor Intraplate Seismic Tremors", description: "As a geologically stable landmass far from active tectonic boundaries, Ireland experiences only rare, low-magnitude intraplate tremors that pose negligible structural risk." }
    ],
    geopoliticalThreats: [
      { title: "Windsor Framework & Northern Ireland Border Margins", description: "Trade and regulatory friction along the Northern Ireland border margin, requiring complex political compromises under the Windsor Framework to preserve peace and trade." },
      { title: "Neutrality Policy & European Common Defense Pressures", description: "Increasing pressure from European partners to align or participate in common security and defense frameworks, challenging its historic policy of military neutrality." },
      { title: "Corporate Tax and FDI Regime Shifts", description: "Vulnerability to changes in global minimum corporate tax rules (OECD Pillar Two), which threaten to reduce tech/pharma FDI, a major pillar of Ireland's economic strategy." }
    ],
    adaptationProjects: [
      { title: "National Coastal Change Management Strategy", description: "A state initiative to construct sustainable coastal defenses, enhance dune nourishment, and map vulnerable coastal zones to mitigate erosion and storm surge risks." },
      { title: "National Peatlands Rehabilitation Program", description: "A comprehensive project to re-wet and restore thousands of hectares of degraded peatlands, restoring their role as key carbon sinks and flood barriers." }
    ],
    pioneerPossibilities: [
      { technique: "Glocalized Tidal & Offshore Wind Engineering", description: "Pioneering the development of deep-water offshore wind farms and tidal energy capture systems along the high-energy Atlantic western seaboard.", originContext: "Shannon Estuary & Atlantic Edge energy projects" }
    ]
  },
  panama: {
    climateVulnerabilityIndex: 6.2,
    seismicVulnerabilityIndex: 5.5,
    geopoliticalFragility: 4.0,
    institutionalStrength: 7.2,
    climateThreats: [
      { title: "Lago Gatún Severe Low-Water Surcharges", description: "Extreme droughts fueled by intense El Niño patterns drop Gatun Lake's surface height, triggering restricted draft drafts and reduced container ship transits." },
      { title: "San Blas Shoreline Sea Inundation", description: "Rising ocean levels flood low-lying islands, forcing the relocation of indigenous Guna Yala communities as early American climate refugees." }
    ],
    geophysicalThreats: [
      { title: "Nazca & Caribbean Tectonic Thrust Frictional Point", description: "Complex subduction and compression along the Panama micro-plate boundary release high-intensity local crustal tremors near the canal lock structures." }
    ],
    geopoliticalThreats: [
      { title: "Great Power Rivalry Over Canal Assets", description: "Sovereign funding interests and technological rivalries between global superpowers regarding logistics operations, automation, and cybersecurity." },
      { title: "Global Logistics Choke-point Re-Routing", description: "Sustained draft reductions force international shipper groups to detour container cargo around alternative sea corridors or continental land rails." }
    ],
    adaptationProjects: [
      { title: "Indio River Basin Reservoir Dredging Plan", description: "A multi-billion dollar master plan to dam the neighboring Indio River, forming an auxiliary reservoir to secure lock water levels during severe droughts." },
      { title: "Watershed Eco-Barrier Afforestation", description: "Enforcing tree-planting rules around the Canal Hydrographic Basin to curb soil erosion, stabilize river flows, and maintain natural mountain groundwater reserves." }
    ],
    pioneerPossibilities: [
      { technique: "Singapore-Inspired Loop water purification and harvesting", description: "Utilizing deep underground recycling tanks and sand filtrations to recycle up to 60% of water used in lock sequences.", originContext: "Universal Industrial catchments" }
    ]
  },
  turkey: {
    climateVulnerabilityIndex: 5.1,
    seismicVulnerabilityIndex: 9.6,
    geopoliticalFragility: 6.5,
    institutionalStrength: 5.8,
    climateThreats: [
      { title: "Anatolian Groundwater Depletion & Wheat Desertification", description: "Prolonged summer heatwaves and intensive unregulated agricultural pumping trigger severe soil desertification, threatening national food security." }
    ],
    geophysicalThreats: [
      { title: "North Anatolian Strike-Slip Fault Hazards", description: "Extreme stress accumulation along the major Anatolian strike-slip boundary system puts the dense metropolis of Istanbul at high risk of a catastrophic seismological rupture." }
    ],
    geopoliticalThreats: [
      { title: "Bosporus & Dardanelles (Montreux Regime) Friction", description: "Sovereign power to restrict naval and military shipping through the Black State straits places Turkey at the center of high-intensity regional naval standoffs." },
      { title: "Eastern Mediterranean EEZ Exploration Disagreements", description: "Naval and political disputes with neighboring states over marine boundaries, gas exploration, and territorial continental shelf claims." }
    ],
    adaptationProjects: [
      { title: "Istanbul Seismic Retrofitting & Urban Renewal Campaign", description: "Massive state programs aimed at reinforcing or reconstructing over 1 million historic masonry and concrete tower complexes to survive peak shear accelerations." },
      { title: "Southeast Anatolian Combined Water Management (GAP)", description: "Utilizing modern mountain reservoirs along the Tigris and Euphrates rivers to maintain agricultural flows during severe summer draught periods." }
    ],
    pioneerPossibilities: [
      { technique: "Base Seismic Damper Isolators", description: "Placing massive rubber and metallic structural layers beneath hospital and school foundations to absorb seismic waves.", originContext: "Tokyolands structural research" }
    ]
  },
  iceland: {
    climateVulnerabilityIndex: 3.5,
    seismicVulnerabilityIndex: 9.4,
    geopoliticalFragility: 1.0,
    institutionalStrength: 9.8,
    climateThreats: [
      { title: "Glacial Cap Ablation & Hydro-electric Disruptions", description: "Sustained retreat of Vatnajökull and other major glacier ice caps alters seasonal water stream flow profiles, impacting geothermal and hydroelectric energy security." }
    ],
    geophysicalThreats: [
      { title: "Reykjanes Peninsula Volcanic Fissures & Rift Seismicity", description: "Drifting along the divergent Mid-Atlantic plate boundary triggers severe volcanic magma breakthroughs, threatening energy hubs like Svartsengi." }
    ],
    geopoliticalThreats: [
      { title: "Arctic Sea Channel Access and GIUK Defense Position", description: "Unlocking northern polar sea lanes increases the military and naval value of the strategic Greenland-Iceland-UK (GIUK) Gap." }
    ],
    adaptationProjects: [
      { title: "Underground CarbFix Carbon Mineralization", description: "Pioneering the industrial dissolution of atmospheric CO2 in geothermal water and injecting it into volcanic basalt formations, turning CO2 into harmless stone in under 2 years." },
      { title: "Reykjanes Basphalt Protective Barriers", description: "Rapid assembly of massive earthen lava barriers to successfully steer high-temperature basaltic runoffs away from critical energy infrastructure." }
    ],
    pioneerPossibilities: [
      { technique: "Subterranean Supercritical Fluid Drills", description: "Drilling directly into active thermal zones to draw extremely high-temperature steam, doubling clean energy yields.", originContext: "Magma exploration" }
    ]
  },
  bangladesh: {
    climateVulnerabilityIndex: 9.4,
    seismicVulnerabilityIndex: 5.2,
    geopoliticalFragility: 6.8,
    institutionalStrength: 5.2,
    climateThreats: [
      { title: "Ganges-Brahmaputra Delta Sea-Level Salinization", description: "Rising ocean levels push saltwater into low-lying coastal farms, destroying rice crops and creating severe freshwater drinking deficits for millions." },
      { title: "Severe Monsoon Rain Intensifications", description: "Erratic summer monsoon peaks trigger massive inland river floods, displacing rural communities and wiping out essential protective soil levees." }
    ],
    geophysicalThreats: [
      { title: "Dauki Fault Line Strike-Slip Squeezes", description: "Intense plate compression from the Himalayas threatens to generate a major earthquake, threatening the dense, unreinforced structures of Dhaka." }
    ],
    geopoliticalThreats: [
      { title: "Transboundary River Hydro-Hegemony", description: "Bangladesh's downstream location leaves it highly vulnerable to Indian upstream barrage controls, causing artificial dry spells and unpredictable flooding." },
      { title: "Cox's Bazar Refugee-Camp Soil Erosion", description: "Hosting over 1 million Rohingya refugees leads to severe forest clearance, accelerating mudslides and topsoil degradation during heavy rains." }
    ],
    adaptationProjects: [
      { title: "Bangladesh Delta Plan (BDP 2100) Implementation", description: "A century-long $37-billion system of polders, flood defense walls, and tidal river control channels to safeguard low-lying economic hubs." },
      { title: "Elevated Solar-Powered Cyclone Shelters", description: "Building community-managed reinforced concrete shelter blocks powered by solar panels, saving millions of lives over recent years." }
    ],
    pioneerPossibilities: [
      { technique: "Floating Grass Bed Agriculture ('Baira')", description: "Crafting floating water-hyacinth rafts to grow crops during prolonged floods, keeping farmers self-sufficient.", originContext: "Deltaic Agrarian Traditions" }
    ]
  },
  drc: {
    climateVulnerabilityIndex: 7.5,
    seismicVulnerabilityIndex: 4.0,
    geopoliticalFragility: 9.1,
    institutionalStrength: 2.2,
    climateThreats: [
      { title: "Congo Forest Rainforest Drought & Logging Impacts", description: "Severe shifts in seasonal rainfall threaten the Congo carbon sinks, raising local fire risks and disrupting traditional farming cycles." }
    ],
    geophysicalThreats: [
      { title: "East African Rift & Nyiragongo Volcanics", description: "Tectonic rifting triggers volcanic fissure breakthroughs, threatening dense cities like Goma with toxic gas releases and hot basalt flows." }
    ],
    geopoliticalThreats: [
      { title: "Mineral Warfare & Sovereign Looting in Kivu East", description: "Armed conflicts over critical tech cobalt, copper, and tin mineral mines trigger devastating refugee displacements and strip the state of mineral tax revenues." },
      { title: "Vast Area Infrastructure Fragmentation", description: "A severe lack of paved transnational highways prevents trade integration and hinders security forces from stabilizing outer provinces." }
    ],
    adaptationProjects: [
      { title: "Grand Inga Dams Hydropower Initiative", description: "An ambitious hydroelectric mega-development capitalizing on the massive flow of the Congo River, aiming to supply green electricity to the continent." },
      { title: "Sovereign Anti-Poaching and Forestry Partnerships", description: "Establishing forest surveillance rules and carbon credit preservation blocks with global environmental networks." }
    ],
    pioneerPossibilities: [
      { technique: "Blockchain Conflict-Mineral Origin Verification", description: "Employing cryptographic ledger databases to track raw copper and cobalt ore from clean pits to manufacturing plants.", originContext: "East-Africa Trade Accords" }
    ]
  },
  egypt: {
    climateVulnerabilityIndex: 8.5,
    seismicVulnerabilityIndex: 3.2,
    geopoliticalFragility: 6.5,
    institutionalStrength: 6.8,
    climateThreats: [
      { title: "Nile Delta Soil Salinization & Sea Level Rise", description: "Accelerating relative sea level rise along the low-lying Nile Delta puts Egypt's most productive agricultural and industrial land assets at direct risk of salinization and inundation." },
      { title: "Extreme Temperature Surges & Crop Evapotranspiration", description: "Sharp increases in summer temperatures trigger heat domes and high agricultural evapotranspiration, placing immense strain on domestic cereal yields and irrigation volumes." }
    ],
    geophysicalThreats: [
      { title: "Gulf of Suez & Levant Boundary Seismicity", description: "Localized crustal stress releases along the divergent Red Sea rift system create moderate, persistent tectonic tremors threatening older masonry buildings in Cairo." }
    ],
    geopoliticalThreats: [
      { title: "Upstream Hydro-Hegemony & GERD Water Allocation", description: "Existential exposure to filling speeds and operational schedules of the Grand Ethiopian Renaissance Dam (GERD) by upstream Ethiopia, exposing Egypt's agricultural base to severe perennial volume drops." },
      { title: "Suez Canal Transit Vulnerability & Regional Conflicts", description: "Strategic dependency on uninterrupted shipping through the Bab-el-Mandeb and Suez Canal. Regional conflicts can instantly divert global shipping around Africa, severing high-value tariff revenues." }
    ],
    adaptationProjects: [
      { title: "Suez Canal SCZone Green Ports Initiative", description: "Upgrading container docks, implementing high-integrity terminal automation, and deploying green hydrogen bunkering assets to establish Suez as a carbon-neutral maritime gate." },
      { title: "Nile Delta Coastal Defense & Polder Reinforcement", description: "Establishing kilometers of low-impact sand dykes, reed barriers, and polder canals to trap mud and prevent salt-wedge intrusion across agricultural soils." },
      { title: "National Canal Lining Initiative", description: "A water conservation project to rehabilitate and line thousands of kilometers of irrigation canals, aiming to reduce water seepage and enhance delivery efficiency to farmlands." },
      { title: "The New Delta Project", description: "A massive desert reclamation megaproject aimed at turning 2.2 million acres of barren desert into productive farmland, using treated agricultural drainage and recycled Nile water." }
    ],
    pioneerPossibilities: [
      { technique: "Sand-Reclamation Perimeter Agriculture", description: "Utilizing deep subterranean saline groundwater processed via solar-powered micro-desalination arrays to irrigate specialized high-salinity crops in the Western Desert.", originContext: "Toshka Lakes Reclamation Schemes" }
    ]
  },
  ukraine: {
    climateVulnerabilityIndex: 5.8,
    seismicVulnerabilityIndex: 2.8,
    geopoliticalFragility: 9.8,
    institutionalStrength: 5.6,
    climateThreats: [
      { title: "Dnipro Hydrological Desiccation & Dam Destructions", description: "War-induced breaches of major river blockages and reservoir infrastructure disrupt perennial cooling water supplies for industrial sites and nuclear facilities." },
      { title: "Steppe Agricultural Drought & Soil Erosion", description: "Rising heatwaves across southern Steppes accelerate crop evapotranspiration, jeopardizing Ukraine's status as a top global wheat and corn exporter." }
    ],
    geophysicalThreats: [
      { title: "Carpathian Foothills Seismic Activity", description: "Minor tectonic tremors emanating from the Vrancea zone in neighboring Romania threaten historical heavy concrete structures." }
    ],
    geopoliticalThreats: [
      { title: "Armed Incursions & Sovereignty Challenges", description: "Existential armed state conflicts, causing critical loss of heavy metallurgical and industrial plant blocks, power grid blackouts, and massive displacement." },
      { title: "Black Sea Port Blockades & Grain Corridor Closures", description: "Naval friction and blockades in Odessa trade bays disrupt bulk agricultural shipping, feeding extreme price inflation globally." }
    ],
    adaptationProjects: [
      { title: "Kyiv-Lviv Grid Hardening & Decentralization", description: "Rebuilding state energy hubs with compact, highly-insulated modular substation cells and micro-solar fields to survive direct shelling." },
      { title: "The Black Sea Humanitarian Maritime corridor", description: "Cooperative, insurance-backed naval routing pathways to secure grain shipping through the Bosporus Strait during conflict." }
    ],
    pioneerPossibilities: [
      { technique: "Dispersed Agrivoltaic Farming Matrices", description: "Integrating vertical solar panel rows above wheat crops to both provide decentralized green micro-power and shield farming soils from solar evaporation.", originContext: "Steppe Agrarian Resilience initiatives" }
    ]
  },
  belgium: {
    climateVulnerabilityIndex: 2.8,
    seismicVulnerabilityIndex: 0.8,
    geopoliticalFragility: 2.2,
    institutionalStrength: 8.9,
    climateThreats: [
      { title: "North Sea Sea-Level Rise", description: "Increasing maritime elevation poses long-term risks to the densely populated coastal lowlands and major port infrastructures of Flanders." },
      { title: "Extreme Heatwaves", description: "Urban heat island effects in Brussels, Antwerp, and Liege, impacting health and placing stress on energy grid capacity." }
    ],
    geophysicalThreats: [
      { title: "Roer Valley Graben Seismicity", description: "Minor seismic activity associated with the Rhine Graben system, representing low-intensity but existing tectonic risk in the eastern provinces." }
    ],
    geopoliticalThreats: [
      { title: "Devolved Sovereign Competencies & Multi-Layer Coordination", description: "Complex split between regional entities Wallonia, Flanders, and Brussels requires extensive coordination for climate budgets." }
    ],
    adaptationProjects: [
      { title: "Coastal Safety Masterplan", description: "A comprehensive multi-decadal plan involving beach nourishment and dike reinforcement to protect the Belgian coastline against storm surges and rising tides." },
      { title: "Sponge City Antwerp", description: "Integration of green-blue infrastructure, including permeable surfaces and urban wetlands, to manage increasing precipitation and combat pluvial flooding." }
    ],
    pioneerPossibilities: [
      { technique: "Dynamic Tidal Barrier Networks", description: "Integrating storm surge barriers to modulate oceanic tidal forces and prevent storm run-offs from flooding inland basins.", originContext: "Scheldt Estuary / Sigma Plan" }
    ]
  },
  japan: {
    climateVulnerabilityIndex: 4.2,
    seismicVulnerabilityIndex: 9.9,
    geopoliticalFragility: 1.8,
    institutionalStrength: 9.2,
    climateThreats: [
      { title: "Typhoons & Intense Coastal Storm Surges", description: "Rising sea-surface temperatures in the Pacific fuel hyper-intense typhoons that threaten low-lying coastal urban zones and reclamation land in Tokyo Bay and Osaka Bay." }
    ],
    geophysicalThreats: [
      { title: "Triple Plate Subduction & Megathrust Earthquake Risks", description: "Sitting at the intersection of the Pacific, Philippine Sea, and Eurasian Plates, Japan is highly vulnerable to subduction ruptures along trenches, capable of triggering massive tsunamis." }
    ],
    geopoliticalThreats: [
      { title: "Maritime Dependency & Supply Line Vulnerabilities", description: "Strategic dependency on unobstructed maritime lanes through the East China Sea and Taiwan Strait leaves Japan's trade highly vulnerable to geopolitical conflicts." }
    ],
    adaptationProjects: [
      { title: "Metropolitan Outer Area Underground Discharge Channel", description: "A massive discharge facility in Saitama designed to protect Tokyo from river overflows." },
      { title: "Seismic Base Isolation & Super-Skyscraper Damping", description: "Pervasive structural reinforcement projects integrating rubber bearings, hydraulic dampers, and tuned mass dampers." }
    ],
    pioneerPossibilities: [
      { technique: "Deep-Ocean Tsunami Early Warning Network (DONET/S-net)", description: "Deploying real-time pressure sensors and seismometers directly on the deep ocean seafloor along subduction trenches to maximize warning lead time.", originContext: "Ocean Trench Seismology" }
    ]
  },
  venezuela: {
    climateVulnerabilityIndex: 6.8,
    seismicVulnerabilityIndex: 7.8,
    geopoliticalFragility: 8.5,
    institutionalStrength: 3.2,
    demographicRiskIndex: 8.8,
    climateThreats: [
      { title: "El Niño Droughts & Hydroelectric Collapse", description: "Extreme dry spells associated with El Niño severely deplete the Guri Reservoir, which supplies over 70% of the country's electricity, causing widespread blackouts." }
    ],
    geophysicalThreats: [
      { title: "Boconó Fault System & Caribbean-South American Plate Collision", description: "Venezuela is highly vulnerable to major earthquakes along the Boconó right-lateral strike-slip fault system, which marks the complex plate boundary zone in the Andes." }
    ],
    geopoliticalThreats: [
      { title: "Sovereign Debt Default & Hyperinflation Strains", description: "Prolonged economic collapse, heavy reliance on crude oil exports, and international sanctions have crippled domestic infrastructure maintenance." }
    ],
    demographicThreats: [
      { title: "Severe Brain Drain & Youth Cohort Flight", description: "The exodus of over 7.7 million citizens (nearly 25% of the pre-crisis population) is heavily concentrated in young, educated, and professional age groups, leaving critical shortages in healthcare, education, and engineering." },
      { title: "Fragility of Remaining Dependent Populations", description: "With a huge chunk of reproductive-age adults leaving, communities are hollowed out, leaving elderly relatives and young children heavily dependent on volatile remittances and deteriorating public infrastructure." }
    ],
    adaptationProjects: [
      { title: "Distributed Small-Scale Solar Power Systems", description: "Installing localized photovoltaic arrays in remote communities to decrease reliance on the fragile national grid." },
      { title: "Seismic Retrofitting of Informal Andean Settlements", description: "Providing structural reinforcements and training to stabilize barrios built on steep mountain slopes in Caracas." }
    ],
    pioneerPossibilities: [
      { technique: "Community Landslide Early Warning Sensors", description: "Deploying low-cost wireless soil moisture sensors and accelerometers on unstable hillsides to warn of imminent landslides.", originContext: "Slope Stability Monitoring" }
    ]
  },
  australia: {
    climateVulnerabilityIndex: 4.8,
    seismicVulnerabilityIndex: 2.0,
    geopoliticalFragility: 1.8,
    demographicRiskIndex: 5.2,
    institutionalStrength: 9.2,
    climateThreats: [
      { title: "Severe Boreal Bushfires", description: "El Niño cycles lengthen the dry summer window, triggering catastrophic fire weather across eastern forests." }
    ],
    geophysicalThreats: [
      { title: "Intraplate Crustal Stress", description: "Shallow, moderate earthquakes along ancient fault lines in the Indo-Australian plate interior." }
    ],
    geopoliticalThreats: [
      { title: "Maritime Trade Lane Security", description: "High economic reliance on clear shipping through Indonesian straits for iron ore and agricultural exports." }
    ],
    adaptationProjects: [
      { title: "Great Barrier Reef Shading", description: "Testing misting systems to cool surface waters and limit coral bleaching events." }
    ],
    pioneerPossibilities: [
      { technique: "Thermal Satellite Fire Tracking", description: "High-frequency imaging to spot ignition vectors in remote bushland.", originContext: "Wilderness Management" }
    ]
  },
  brazil: {
    climateVulnerabilityIndex: 5.8,
    seismicVulnerabilityIndex: 1.2,
    geopoliticalFragility: 3.5,
    demographicRiskIndex: 4.8,
    institutionalStrength: 7.8,
    climateThreats: [
      { title: "Amazon Rainforest Drying", description: "Severe dry periods in northern states promote leaf litter build-up and destructive forest fires." }
    ],
    geophysicalThreats: [
      { title: "Stable Cratonic Geology", description: "Minimal seismic activity due to location on the stable South American plate interior." }
    ],
    geopoliticalThreats: [
      { title: "Amazon Frontier Smuggling", description: "Illegal logging and gold extraction crossing porous borders with Colombia and Venezuela." }
    ],
    adaptationProjects: [
      { title: "Sertao Semi-Arid Irrigation", description: "Upgrading dams and canals to sustain farming through dry periods." }
    ],
    pioneerPossibilities: [
      { technique: "Agroforestry Carbon Buffers", description: "Combining food crops with canopy trees to restore degraded lands.", originContext: "Rainforest Conservation" }
    ]
  },
  chad: {
    climateVulnerabilityIndex: 8.8,
    seismicVulnerabilityIndex: 1.5,
    geopoliticalFragility: 8.8,
    demographicRiskIndex: 7.5,
    institutionalStrength: 2.5,
    climateThreats: [
      { title: "Lake Chad Shrinkage", description: "Extreme evaporation and water extraction reduce the lake basin size, destroying local livelihoods." }
    ],
    geophysicalThreats: [
      { title: "Stable Shield Interior", description: "Zero recorded tectonic fault lines across the Sahara shield." }
    ],
    geopoliticalThreats: [
      { title: "Sahel Border Vulnerability", description: "Incursions from armed groups crossing remote border lines from Libya and Sudan." }
    ],
    adaptationProjects: [
      { title: "Lake Basin Restoration", description: "Bilateral programs to regulate community irrigation and protect wetlands." }
    ],
    pioneerPossibilities: [
      { technique: "Dune Stabilization Barriers", description: "Planting drought-hardy shrubs to stop sand encroaching on farmland.", originContext: "Sahel Desert Control" }
    ]
  },
  cuba: {
    climateVulnerabilityIndex: 8.2,
    seismicVulnerabilityIndex: 5.5,
    geopoliticalFragility: 7.2,
    demographicRiskIndex: 7.5,
    institutionalStrength: 5.8,
    climateThreats: [
      { title: "Category 5 Atlantic Hurricanes", description: "Severe storms cross the Caribbean, causing massive storm surges and flooding in Havana." }
    ],
    geophysicalThreats: [
      { title: "Oriente Strike-Slip Fault", description: "Moderate tectonic stress along the Caribbean-North American plate boundary." }
    ],
    geopoliticalThreats: [
      { title: "Trade Embargo Constraints", description: "Trade isolation limits foreign capital and access to parts for infrastructure repair." }
    ],
    adaptationProjects: [
      { title: "Mangrove Shield Reforestation", description: "Planting dense coastal mangroves to absorb storm surge waves." }
    ],
    pioneerPossibilities: [
      { technique: "Community Storm Action Plans", description: "Highly structured neighborhood systems for immediate evacuation and shelter deployment.", originContext: "Disaster Preparedness" }
    ]
  },
  ethiopia: {
    climateVulnerabilityIndex: 7.5,
    seismicVulnerabilityIndex: 4.8,
    geopoliticalFragility: 7.8,
    demographicRiskIndex: 6.2,
    institutionalStrength: 3.8,
    climateThreats: [
      { title: "Highland Soil Erosion", description: "Sudden monsoonal downpours wash away fertile topsoils on steep agricultural slopes." }
    ],
    geophysicalThreats: [
      { title: "East African Rift Faults", description: "Active extension zone prone to volcanic action and shallow tremors." }
    ],
    geopoliticalThreats: [
      { title: "GERD Nile River Dispute", description: "Downstream tension with Egypt and Sudan over reservoir water capture." }
    ],
    adaptationProjects: [
      { title: "Highland Terracing", description: "Constructing rock walls on slopes to trap water and soil." }
    ],
    pioneerPossibilities: [
      { technique: "Micro-Dam Water Storage", description: "Small, community-maintained reservoirs to capture highland rains.", originContext: "Water Security" }
    ]
  },
  france: {
    climateVulnerabilityIndex: 3.8,
    seismicVulnerabilityIndex: 2.8,
    geopoliticalFragility: 2.0,
    demographicRiskIndex: 7.2,
    institutionalStrength: 9.0,
    climateThreats: [
      { title: "Paris Heat Dome Risks", description: "Intense heat waves stress urban energy networks and public health grids." }
    ],
    geophysicalThreats: [
      { title: "Alpine Collisional Stresses", description: "Moderate seismicity along the southern Alps and Pyrenees thrusts." }
    ],
    geopoliticalThreats: [
      { title: "Sovereign Energy Transitions", description: "Securing uranium imports for the nuclear-dominated domestic energy grid." }
    ],
    adaptationProjects: [
      { title: "Urban Canals Greening", description: "Planting trees and green belts in Paris to reduce heat island effects." }
    ],
    pioneerPossibilities: [
      { technique: "National Heat Warning Systems", description: "Real-time alerts to target water and medical aid to vulnerable citizens.", originContext: "Public Health Networks" }
    ]
  },
  germany: {
    climateVulnerabilityIndex: 3.5,
    seismicVulnerabilityIndex: 2.0,
    geopoliticalFragility: 1.8,
    demographicRiskIndex: 7.8,
    institutionalStrength: 9.0,
    climateThreats: [
      { title: "Rhine Transport Bottlenecks", description: "Low river levels in summer stop bulk cargo shipping along Europe's main commercial artery." }
    ],
    geophysicalThreats: [
      { title: "Rhine Graben Rifting", description: "Minor fault stresses capable of triggering shallow earthquakes near cities." }
    ],
    geopoliticalThreats: [
      { title: "Central Gas Transit reliance", description: "Securing stable energy pathways following the cutoff of direct eastern imports." }
    ],
    adaptationProjects: [
      { title: "Sponge City Berlin", description: "Adding green roofs and flood channels to collect and reuse stormwater runoff." }
    ],
    pioneerPossibilities: [
      { technique: "Rhine Dredging Adaptation", description: "Modifying barge hulls and river beds to sustain transport in low water.", originContext: "Logistics Engineering" }
    ]
  },
  india: {
    climateVulnerabilityIndex: 6.8,
    seismicVulnerabilityIndex: 6.5,
    geopoliticalFragility: 4.2,
    demographicRiskIndex: 4.5,
    institutionalStrength: 7.5,
    climateThreats: [
      { title: "Monsoon Volatility", description: "Irregular summer rains trigger severe farming droughts or massive crop flooding." }
    ],
    geophysicalThreats: [
      { title: "Himalayan Plate Thrusts", description: "Severe risk of megathrust earthquakes as the Indian plate moves under Asia." }
    ],
    geopoliticalThreats: [
      { title: "Dual Border Conflict Strains", description: "Persistent border security disputes with both Pakistan and China." }
    ],
    adaptationProjects: [
      { title: "National River Interlinking", description: "Canals to transfer excess monsoon water from flood zones to dry farming belts." }
    ],
    pioneerPossibilities: [
      { technique: "Monsoon Radar Warning Grids", description: "High-density satellite arrays predicting local rainfall hours ahead.", originContext: "Agricultural Seeding" }
    ]
  },
  indonesia: {
    climateVulnerabilityIndex: 7.8,
    seismicVulnerabilityIndex: 9.8,
    geopoliticalFragility: 3.5,
    demographicRiskIndex: 4.8,
    institutionalStrength: 7.2,
    climateThreats: [
      { title: "Jakarta Delta Sinking", description: "Excessive groundwater extraction causes coastal areas to sink beneath sea level." }
    ],
    geophysicalThreats: [
      { title: "Sunda Trench Subduction", description: "High risk of extreme earthquakes, volcanic eruptions, and tsunamis." }
    ],
    geopoliticalThreats: [
      { title: "Archipelagic Sovereignty Protection", description: "Naval patrols to secure remote shipping corridors and fishing territories." }
    ],
    adaptationProjects: [
      { title: "Nusantara Capital Relocation", description: "Moving the administrative capital to Borneo to escape Jakarta's flood risks." }
    ],
    pioneerPossibilities: [
      { technique: "Deep-Sea Tsunami Buoys", description: "Acoustic seafloor sensors linked to global satellite networks.", originContext: "Tsunami Early Warning" }
    ]
  },
  iran: {
    climateVulnerabilityIndex: 6.5,
    seismicVulnerabilityIndex: 8.8,
    geopoliticalFragility: 7.8,
    demographicRiskIndex: 5.5,
    institutionalStrength: 4.8,
    climateThreats: [
      { title: "Lake Urmia Desiccation", description: "Severe droughts and river diversion dry up vital saline lakes, creating toxic dust storms." }
    ],
    geophysicalThreats: [
      { title: "Zagros Collisional Thrusts", description: "High seismic hazard across major cities due to Arabian-Eurasian plate crush." }
    ],
    geopoliticalThreats: [
      { title: "Strait of Hormuz Stiffening", description: "Naval blockades and trade limits disrupt crucial oil supply lines." }
    ],
    adaptationProjects: [
      { title: "Seismic Retrofitting of Cities", description: "Upgrading concrete standards to protect old brick buildings." }
    ],
    pioneerPossibilities: [
      { technique: "Qanat Restorations", description: "Reviving ancient underground canals to prevent evaporation losses.", originContext: "Arid Water Management" }
    ]
  },
  israel: {
    climateVulnerabilityIndex: 5.5,
    seismicVulnerabilityIndex: 6.5,
    geopoliticalFragility: 8.2,
    demographicRiskIndex: 4.0,
    institutionalStrength: 8.8,
    climateThreats: [
      { title: "Negev Desertification", description: "Declining winter rains push dry conditions north into farming zones." }
    ],
    geophysicalThreats: [
      { title: "Dead Sea Fault Line", description: "Transform plate boundary with potential for moderate earthquakes." }
    ],
    geopoliticalThreats: [
      { title: "Border Security Strains", description: "Persistent defense requirements against regional non-state networks." }
    ],
    adaptationProjects: [
      { title: "Desalination Network Expansion", description: "Converting Mediterranean water to supply over 80% of domestic water." }
    ],
    pioneerPossibilities: [
      { technique: "Drip Irrigation Glocalization", description: "Computer-controlled root watering to maximize crop yield.", originContext: "Desert Agriculture" }
    ]
  },
  italy: {
    climateVulnerabilityIndex: 4.5,
    seismicVulnerabilityIndex: 7.5,
    geopoliticalFragility: 2.2,
    demographicRiskIndex: 8.5,
    institutionalStrength: 8.5,
    climateThreats: [
      { title: "Venice Lagoon Flooding", description: "High tides and sea level rise flood historic urban zones." }
    ],
    geophysicalThreats: [
      { title: "Active Volcanism & Faults", description: "Seismic risk from Apennine faults and active volcanic chambers (Vesuvius)." }
    ],
    geopoliticalThreats: [
      { title: "Mediterranean Migration Shifts", description: "Strategic demands to patrol southern sea borders and coordinate European agreements." }
    ],
    adaptationProjects: [
      { title: "MOSE Storm Barriers", description: "Deploying steel floodgates to block high tides entering Venice." }
    ],
    pioneerPossibilities: [
      { technique: "Volcanic Tremor Satellites", description: "Using ground-movement radars to predict eruptions early.", originContext: "Seismic Geodesy" }
    ]
  },
  kenya: {
    climateVulnerabilityIndex: 6.5,
    seismicVulnerabilityIndex: 4.0,
    geopoliticalFragility: 5.2,
    demographicRiskIndex: 6.0,
    institutionalStrength: 7.2,
    climateThreats: [
      { title: "Northern Dryland Droughts", description: "Failed seasonal rains cause cattle losses and farming collapse in northern counties." }
    ],
    geophysicalThreats: [
      { title: "Rift Valley Fault zones", description: "Minor fault action leading to road cracks and shallow tremors." }
    ],
    geopoliticalThreats: [
      { title: "Somali Border Insecurity", description: "Terrorist threats from Al-Shabaab disrupting regional trade." }
    ],
    adaptationProjects: [
      { title: "Geothermal Grid Integration", description: "Tapping rift heat to reduce reliance on hydro dams during drought." }
    ],
    pioneerPossibilities: [
      { technique: "Community Rainwater Nets", description: "Cheap plastic tanks to collect rain from roofs for local farms.", originContext: "Dryland Survival" }
    ]
  },
  malaysia: {
    climateVulnerabilityIndex: 5.2,
    seismicVulnerabilityIndex: 2.8,
    geopoliticalFragility: 2.8,
    demographicRiskIndex: 4.8,
    institutionalStrength: 8.2,
    climateThreats: [
      { title: "Kuala Lumpur Flash Inundation", description: "Heavy tropical downpours exceed city drainage carrying capacities." }
    ],
    geophysicalThreats: [
      { title: "Sabah Seismic Frictions", description: "Minor fault stress release on Borneo triggering occasional slides." }
    ],
    geopoliticalThreats: [
      { title: "Malacca Strait Patrols", description: "Securing shipping routes against sea piracy and illegal transit." }
    ],
    adaptationProjects: [
      { title: "SMART Tunnel expansion", description: "Using vehicle tunnels to bypass floodwaters away from the city center." }
    ],
    pioneerPossibilities: [
      { technique: "Reef Restorations", description: "Building concrete structures to grow heat-hardy coral species.", originContext: "Marine Ecology" }
    ]
  },
  mexico: {
    climateVulnerabilityIndex: 6.2,
    seismicVulnerabilityIndex: 8.0,
    geopoliticalFragility: 4.8,
    demographicRiskIndex: 4.2,
    institutionalStrength: 6.5,
    climateThreats: [
      { title: "Northern Desertification", description: "Heatwaves and low rainfall force cattle ranches out of business." }
    ],
    geophysicalThreats: [
      { title: "Cocos Plate Subduction", description: "Severe risk of megathrust earthquakes affecting Mexico City's soft basin." }
    ],
    geopoliticalThreats: [
      { title: "Narcotics Cartel Control", description: "Armed groups contest border corridors and shipping hubs." }
    ],
    adaptationProjects: [
      { title: "SASMEX Seismic Sirens", description: "Radio warnings triggered by ocean sensors to alert inland cities." }
    ],
    pioneerPossibilities: [
      { technique: "Mexico City Aquifer Recharge", description: "Pumping rainwater back into dry subsoils to stop city sinking.", originContext: "Urban Hydrology" }
    ]
  },
  netherlands: {
    climateVulnerabilityIndex: 4.5,
    seismicVulnerabilityIndex: 3.2,
    geopoliticalFragility: 1.5,
    demographicRiskIndex: 7.8,
    institutionalStrength: 9.5,
    climateThreats: [
      { title: "Sea Level Rise Flooding", description: "Over 25% of the land sits below sea level, demanding constant pumping." }
    ],
    geophysicalThreats: [
      { title: "Induced Gas Tremors", description: "Earthquakes triggered by gas extraction in the northern Groningen field." }
    ],
    geopoliticalThreats: [
      { title: "Rotterdam Port Security", description: "Vulnerability to maritime bottleneck blocks affecting European trade." }
    ],
    adaptationProjects: [
      { title: "Delta Sea Barriers", description: "Dynamic storm gates that lock during extreme North Sea surges." }
    ],
    pioneerPossibilities: [
      { technique: "Floating Urban Modules", description: "Building roads and housing on hollow concrete blocks that rise with tides.", originContext: "Estuarine Adaptation" }
    ]
  },
  niger: {
    climateVulnerabilityIndex: 8.5,
    seismicVulnerabilityIndex: 1.5,
    geopoliticalFragility: 8.5,
    demographicRiskIndex: 7.8,
    institutionalStrength: 3.0,
    climateThreats: [
      { title: "Sahara Desert Expansion", description: "Drying sand dunes swallow farm zones in northern regions." }
    ],
    geophysicalThreats: [
      { title: "Stable Craton Interior", description: "No active tectonic faults present across national territory." }
    ],
    geopoliticalThreats: [
      { title: "Sahel Coup Isolation", description: "Junta leadership isolates the country from West African trade blocs." }
    ],
    adaptationProjects: [
      { title: "Great Green Wall Plantings", description: "Planting a belt of native trees to block desert winds and trap moisture." }
    ],
    pioneerPossibilities: [
      { technique: "Solar Aquifer Pumps", description: "Deep wells powered by solar grids to irrigate dry crops.", originContext: "Sahel Farm Security" }
    ]
  },
  nigeria: {
    climateVulnerabilityIndex: 7.8,
    seismicVulnerabilityIndex: 1.5,
    geopoliticalFragility: 7.5,
    demographicRiskIndex: 6.5,
    institutionalStrength: 4.2,
    climateThreats: [
      { title: "Lagos Coastal Floods", description: "Sea level rise and poor drainage cause severe flooding in coastal slums." }
    ],
    geophysicalThreats: [
      { title: "Stable African Shield", description: "Zero tectonic risk due to location away from plate edges." }
    ],
    geopoliticalThreats: [
      { title: "Niger Delta Sabotage", description: "Oil theft and militancy in southern marshes disrupt revenues." }
    ],
    adaptationProjects: [
      { title: "Eko Atlantic Seawall", description: "A massive rock barrier protecting Lagos harbor from erosion." }
    ],
    pioneerPossibilities: [
      { technique: "Coastal Mangrove Nursery", description: "Growing thousands of seedlings to replant protective delta walls.", originContext: "Delta Protection" }
    ]
  },
  peru: {
    climateVulnerabilityIndex: 6.8,
    seismicVulnerabilityIndex: 8.5,
    geopoliticalFragility: 4.8,
    demographicRiskIndex: 4.5,
    institutionalStrength: 6.0,
    climateThreats: [
      { title: "Andean Glacial Loss", description: "Glacier melting reduces water flow to coastal desert cities." }
    ],
    geophysicalThreats: [
      { title: "Nazca-South American Subduction", description: "Severe risk of megathrust earthquakes and tsunami shocks along the coast." }
    ],
    geopoliticalThreats: [
      { title: "Amazonian Gold Chaos", description: "Illegal miners pollute rivers with mercury in remote jungle states." }
    ],
    adaptationProjects: [
      { title: "Lima Mountain Reservoirs", description: "Dams to trap rain during winter to secure dry season supply." }
    ],
    pioneerPossibilities: [
      { technique: "Desert Fog Harvesting Nets", description: "Using plastic mesh nets to catch moisture from coastal fog layers.", originContext: "Arid Water Capture" }
    ]
  },
  philippines: {
    climateVulnerabilityIndex: 8.8,
    seismicVulnerabilityIndex: 8.5,
    geopoliticalFragility: 4.5,
    demographicRiskIndex: 5.0,
    institutionalStrength: 6.8,
    climateThreats: [
      { title: "Pacific Super-Typhoons", description: "Increasingly frequent storms cause storm surges and landslides." }
    ],
    geophysicalThreats: [
      { title: "Philippine Fault Zone", description: "Active subduction zone prone to volcanism and tsunamis." }
    ],
    geopoliticalThreats: [
      { title: "South China Sea Sovereignty", description: "Friction with Chinese vessels over fishing grounds and islands." }
    ],
    adaptationProjects: [
      { title: "Evacuation Center networks", description: "Concrete shelter domes constructed in high-risk coastal towns." }
    ],
    pioneerPossibilities: [
      { technique: "Typhoon Dome Shelters", description: "Aerodynamic concrete structures that withstand winds of 300+ km/h.", originContext: "Coastal Survival" }
    ]
  },
  poland: {
    climateVulnerabilityIndex: 4.2,
    seismicVulnerabilityIndex: 1.5,
    geopoliticalFragility: 3.8,
    demographicRiskIndex: 8.0,
    institutionalStrength: 8.0,
    climateThreats: [
      { title: "Vistula River Drought", description: "Declining summer rainfall levels threaten agricultural irrigation grids." }
    ],
    geophysicalThreats: [
      { title: "Tectonic Stability", description: "Stable interior positioning protects the country from seismic activity." }
    ],
    geopoliticalThreats: [
      { title: "Suwalki Gap Vulnerability", description: "Border strip adjacent to Kaliningrad represents a strategic defensive bottleneck." }
    ],
    adaptationProjects: [
      { title: "Coal-to-Nuclear Shift", description: "Sovereign transition plan to build nuclear plants to replace aging coal facilities." }
    ],
    pioneerPossibilities: [
      { technique: "Agricultural Soil Sensors", description: "Low-cost soil moisture grids to optimize farm water use during drought.", originContext: "Smart Farming" }
    ]
  },
  russia: {
    climateVulnerabilityIndex: 4.8,
    seismicVulnerabilityIndex: 4.5,
    geopoliticalFragility: 6.8,
    demographicRiskIndex: 8.2,
    institutionalStrength: 5.2,
    climateThreats: [
      { title: "Siberian Permafrost Melt", description: "Warming ground melts foundations, damaging roads and gas pipelines." }
    ],
    geophysicalThreats: [
      { title: "Kamchatka Volcano Belt", description: "Active subduction zone causing regular deep earthquakes and ash clouds." }
    ],
    geopoliticalThreats: [
      { title: "Arctic Sovereignty Strains", description: "Asserting control over the Northern Sea Route as polar ice thaws." }
    ],
    adaptationProjects: [
      { title: "Permafrost Thermosyphons", description: "Installing cooling tubes around pipelines to keep the ground frozen." }
    ],
    pioneerPossibilities: [
      { technique: "Polar Route Satellites", description: "Tracking sea ice shifts in real time to guide commercial transit routes.", originContext: "Arctic Logistics" }
    ]
  },
  rwanda: {
    climateVulnerabilityIndex: 6.2,
    seismicVulnerabilityIndex: 4.5,
    geopoliticalFragility: 4.2,
    demographicRiskIndex: 5.8,
    institutionalStrength: 8.0,
    climateThreats: [
      { title: "Hillside Erosion Mudslides", description: "Intense downpours saturate soil on steep hills, triggering landslips." }
    ],
    geophysicalThreats: [
      { title: "Albertine Rift Faults", description: "Located near active rift valleys prone to deep volcanic gas leaks." }
    ],
    geopoliticalThreats: [
      { title: "DRC Border Friction", description: "Security challenges linked to instability in neighboring eastern Congo." }
    ],
    adaptationProjects: [
      { title: "Kigali Drainage Upgrades", description: "Upgrading concrete channels to prevent urban flash flooding." }
    ],
    pioneerPossibilities: [
      { technique: "Hillside Terrace Buffers", description: "Using deep-root grasses (vetiver) to anchor soil along crop terraces.", originContext: "Soil Preservation" }
    ]
  },
  "saudi-arabia": {
    climateVulnerabilityIndex: 6.2,
    seismicVulnerabilityIndex: 3.2,
    geopoliticalFragility: 4.2,
    demographicRiskIndex: 5.2,
    institutionalStrength: 8.2,
    climateThreats: [
      { title: "Aquifer Exhaustion", description: "Over-pumping has severely depleted non-renewable desert aquifers." }
    ],
    geophysicalThreats: [
      { title: "Red Sea Rift Volcanics", description: "Ancient volcanic fields (Harrat) capable of generating minor seismic action." }
    ],
    geopoliticalThreats: [
      { title: "Bab-el-Mandeb Choke-point", description: "Maritime bottleneck vulnerable to proxy conflicts and shipping halts." }
    ],
    adaptationProjects: [
      { title: "NEOM Desalination Grids", description: "Constructing solar-powered desalination facilities to supply clean water." }
    ],
    pioneerPossibilities: [
      { technique: "Deep Sand Aquifer Shields", description: "Using subterranean membranes to prevent water evaporation in storage.", originContext: "Desert Storage" }
    ]
  },
  singapore: {
    climateVulnerabilityIndex: 5.5,
    seismicVulnerabilityIndex: 2.0,
    geopoliticalFragility: 2.0,
    demographicRiskIndex: 8.0,
    institutionalStrength: 9.5,
    climateThreats: [
      { title: "Sea Level Coastal Rise", description: "Low altitude islands vulnerable to sea levels overflowing port facilities." }
    ],
    geophysicalThreats: [
      { title: "Sumatran Subduction Tremors", description: "Minor shaking felt in tall buildings from distant Sumatran earthquakes." }
    ],
    geopoliticalThreats: [
      { title: "Absolute Water Dependence", description: "Relying on cross-border pipelines from Malaysia for fresh water." }
    ],
    adaptationProjects: [
      { title: "NEWater Recycling", description: "Advanced filtration converting wastewater to high-purity industrial supply." }
    ],
    pioneerPossibilities: [
      { technique: "Seawalls with Integrated Gates", description: "Elevating coastal defenses and installing massive pumps at river mouths.", originContext: "Coastal Infrastructure" }
    ]
  },
  "south-africa": {
    climateVulnerabilityIndex: 5.5,
    seismicVulnerabilityIndex: 2.2,
    geopoliticalFragility: 4.5,
    demographicRiskIndex: 5.8,
    institutionalStrength: 7.2,
    climateThreats: [
      { title: "Cape Town Day Zero", description: "Failed winter rains bring major city reservoir levels near empty." }
    ],
    geophysicalThreats: [
      { title: "Mining Induced Tremors", description: "Shallow, localized earthquakes caused by deep-level gold mining stresses." }
    ],
    geopoliticalThreats: [
      { title: "Energy Grid Failures", description: "Aging coal generation plants lead to persistent load-shedding blackouts." }
    ],
    adaptationProjects: [
      { title: "Table Mountain Aquifer Tap", description: "Boring wells into mountain stone to supplement city water supplies." }
    ],
    pioneerPossibilities: [
      { technique: "Water Leak Sensor Grid", description: "Automated sound sensors to identify underground pipe leaks early.", originContext: "Resource Management" }
    ]
  },
  "south-korea": {
    climateVulnerabilityIndex: 3.8,
    seismicVulnerabilityIndex: 4.5,
    geopoliticalFragility: 3.2,
    demographicRiskIndex: 9.2,
    institutionalStrength: 8.8,
    climateThreats: [
      { title: "Typhoon Inundation", description: "Increasingly frequent summer storms cause flash flooding in southern ports." }
    ],
    geophysicalThreats: [
      { title: "Yangsan Fault activity", description: "Moderate earthquakes along the active eastern shear zones." }
    ],
    geopoliticalThreats: [
      { title: "DMZ Border Hostility", description: "Persistent security standoffs along the demilitarized zone boundary." }
    ],
    adaptationProjects: [
      { title: "Busan Floating Seawalls", description: "Reinforcing coastal harbor defenses to block extreme typhoon surges." }
    ],
    pioneerPossibilities: [
      { technique: "Smart Drain Networks", description: "Automated pump stations that clear streets before flooding occurs.", originContext: "Urban Engineering" }
    ]
  },
  sudan: {
    climateVulnerabilityIndex: 8.5,
    seismicVulnerabilityIndex: 2.5,
    geopoliticalFragility: 9.0,
    demographicRiskIndex: 7.2,
    institutionalStrength: 2.0,
    climateThreats: [
      { title: "Sahel Desert Encroachment", description: "Drying trends push dunes south, choking Nile agricultural tracts." }
    ],
    geophysicalThreats: [
      { title: "Red Sea Rift Tremors", description: "Minor faulting along the marine extension boundary." }
    ],
    geopoliticalThreats: [
      { title: "Civil War Chaos", description: "Intense clashes destroy infrastructure and block aid delivery routes." }
    ],
    adaptationProjects: [
      { title: "Port Sudan Water Channels", description: "Securing municipal supply lines from remote mountain aquifers." }
    ],
    pioneerPossibilities: [
      { technique: "Crop Health Satellites", description: "Using drone cameras to plan crop seeding around dry spells.", originContext: "Sahel Agriculture" }
    ]
  },
  switzerland: {
    climateVulnerabilityIndex: 2.8,
    seismicVulnerabilityIndex: 2.2,
    geopoliticalFragility: 1.2,
    demographicRiskIndex: 6.2,
    institutionalStrength: 9.5,
    climateThreats: [
      { title: "Alpine Glacier Shrinkage", description: "Melting glaciers threaten long-term summer river flows and power dams." }
    ],
    geophysicalThreats: [
      { title: "Valais Fault zone", description: "Moderate seismic hazard in the southern valleys prone to rockfalls." }
    ],
    geopoliticalThreats: [
      { title: "EU Bilateral Strain", description: "Non-member status requires negotiating complex border and trade deals." }
    ],
    adaptationProjects: [
      { title: "Glacial outflow barriers", description: "Dams built below melting glaciers to capture rock and mud debris." }
    ],
    pioneerPossibilities: [
      { technique: "Alpine Laser Warning Grids", description: "Real-time laser sensors detecting small rock slides in valleys.", originContext: "Mountain Safety" }
    ]
  },
  thailand: {
    climateVulnerabilityIndex: 6.8,
    seismicVulnerabilityIndex: 3.8,
    geopoliticalFragility: 3.8,
    demographicRiskIndex: 7.5,
    institutionalStrength: 7.5,
    climateThreats: [
      { title: "Bangkok Delta Sinking", description: "Rising seas and river overflows flood low-lying urban areas." }
    ],
    geophysicalThreats: [
      { title: "Myanmar Border Faults", description: "Moderate shear faults capable of causing local tremors." }
    ],
    geopoliticalThreats: [
      { title: "Mekong River flow capture", description: "Bilateral disputes with upstream states over dams drying the river." }
    ],
    adaptationProjects: [
      { title: "Chao Phraya Flood Channels", description: "Diverting river crests around Bangkok directly into the sea." }
    ],
    pioneerPossibilities: [
      { technique: "Saline Rice Cultivation", description: "Developing rice seeds that grow in coastal saline waters.", originContext: "Delta Agriculture" }
    ]
  },
  tuvalu: {
    climateVulnerabilityIndex: 9.8,
    seismicVulnerabilityIndex: 3.5,
    geopoliticalFragility: 3.5,
    demographicRiskIndex: 5.5,
    institutionalStrength: 6.8,
    climateThreats: [
      { title: "Sea Level Inundation", description: "Islands sit close to sea level, risking complete drowning by 2050." }
    ],
    geophysicalThreats: [
      { title: "Pacific Tsunami Risks", description: "Subduction tremors trigger sea waves that cross low sand bars." }
    ],
    geopoliticalThreats: [
      { title: "Loss of Statehood", description: "Sovereign survival threatened by territory loss, forcing emigration plans." }
    ],
    adaptationProjects: [
      { title: "Funafuti Reclamation", description: "Dredging sea sand to elevate critical living spaces above storm tides." }
    ],
    pioneerPossibilities: [
      { technique: "Digital Nation Archiving", description: "Replicating land registers and history on secure remote servers.", originContext: "State Preservation" }
    ]
  },
  uae: {
    climateVulnerabilityIndex: 6.5,
    seismicVulnerabilityIndex: 3.5,
    geopoliticalFragility: 3.5,
    demographicRiskIndex: 5.2,
    institutionalStrength: 8.5,
    climateThreats: [
      { title: "Lethal Heatwave events", description: "Summer heat indexes exceed safety limits, halting open-air work." }
    ],
    geophysicalThreats: [
      { title: "Persian Gulf tremors", description: "Shockwaves felt from Zagros collisional faults across the sea." }
    ],
    geopoliticalThreats: [
      { title: "Hormuz Shipping Safety", description: "Disruptions along the Persian Gulf outlet affect oil exports." }
    ],
    adaptationProjects: [
      { title: "Desalination solar conversions", description: "Upgrading systems to use solar arrays rather than gas power." }
    ],
    pioneerPossibilities: [
      { technique: "Urban Cooling Towers", description: "Installing giant wind towers that spray mist to cool public squares.", originContext: "Desert Urbanism" }
    ]
  },
  uk: {
    climateVulnerabilityIndex: 3.8,
    seismicVulnerabilityIndex: 1.8,
    geopoliticalFragility: 2.0,
    demographicRiskIndex: 7.0,
    institutionalStrength: 9.0,
    climateThreats: [
      { title: "Thames Estuary Surges", description: "North Sea storms push high waters up the Thames, threatening London." }
    ],
    geophysicalThreats: [
      { title: "Intraplate Tremors", description: "Minor fault release in Scotland and Wales causing low-grade shaking." }
    ],
    geopoliticalThreats: [
      { title: "Dover Strait security", description: "Patrolling channel lanes to handle cargo traffic and border crossings." }
    ],
    adaptationProjects: [
      { title: "Thames Barrier upgrades", description: "Elevating dynamic floodgates to withstand rising sea levels." }
    ],
    pioneerPossibilities: [
      { technique: "Coastal Managed realignment", description: "Allowing low farmland to flood naturally to create protective marshes.", originContext: "Coastal Safety" }
    ]
  },
  vietnam: {
    climateVulnerabilityIndex: 7.5,
    seismicVulnerabilityIndex: 3.2,
    geopoliticalFragility: 3.8,
    demographicRiskIndex: 5.5,
    institutionalStrength: 7.2,
    climateThreats: [
      { title: "Mekong Delta Drowning", description: "Rising seas flood low-lying rice fields with saltwater, destroying crops." }
    ],
    geophysicalThreats: [
      { title: "Red River fault zones", description: "Minor earthquakes along the northern mountain valleys." }
    ],
    geopoliticalThreats: [
      { title: "Upstream Mekong Control", description: "Dams built in China and Laos restrict seasonal water flow." }
    ],
    adaptationProjects: [
      { title: "Mekong Salinity Dykes", description: "Constructing concrete sluice gates to block incoming ocean tides." }
    ],
    pioneerPossibilities: [
      { technique: "Saline Aquaculture Shift", description: "Switching from rice farming to shrimp farming in salt-hit zones.", originContext: "Delta Survival" }
    ]
  }
};

export const getFallbackProfile = (countryName: string): RiskProfile => {
  return {
    climateVulnerabilityIndex: 5.2,
    seismicVulnerabilityIndex: 1.8,
    geopoliticalFragility: 4.8,
    institutionalStrength: 5.0,
    climateThreats: [
      { title: `${countryName} Climatic Shift Stressors`, description: "Rising seasonal temperature volatility and shifting rainfall distribution threaten local crop cycles and stress industrial power grids." },
      { title: "Regional Resource Scarcity", description: "Unpredictable clean groundwater levels and thermal strains stress public reservoir capacities." }
    ],
    geophysicalThreats: [
      { title: "Minor Tectonic Fault Lines", description: "Moderate hazard from secondary plate faults, calling for basic building code standards and seismic risk awareness." }
    ],
    geopoliticalThreats: [
      { title: "Global Commodity Price Volatility", description: "Extreme vulnerability to international food and energy inflation waves and supply line dependencies." }
    ],
    adaptationProjects: [
      { title: "Water Distribution Infrastructure Upgrades", description: "Constructing modern municipal storage tanks and reinforcing urban drainage channels to withstand sudden downpours." }
    ],
    pioneerPossibilities: [
      { technique: "Community Rainwater Storage Matrices", description: "Using robust plastic sand-filtration tanks to trap and store water for dry periods.", originContext: "Dryland Water Security Schemes" }
    ]
  };
};
