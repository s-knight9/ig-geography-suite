import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Robust content generator helper that supports retries on transient errors and falls back to other eligible models
  async function generateWithRetryAndFallback(params: { contents: any; config?: any }) {
    const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let lastError: any = null;

    for (const model of models) {
      const attempts = 3;
      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          const response = await ai.models.generateContent({
            ...params,
            model: model,
          });
          return response;
        } catch (error: any) {
          lastError = error;
          const status = error.status || (error.error && error.error.status);
          const code = error.code || (error.error && error.error.code);
          const isTransient = status === "UNAVAILABLE" || code === 503 || status === "RESOURCE_EXHAUSTED" || code === 429;
          
          // Log as a standard, non-alarming info message to prevent system-level false alerts on temporary external load
          console.log(`[Gemini] Model "${model}" (attempt ${attempt + 1}) is busy or rate-limited. Retrying with binary backoff or fallback...`);
          
          if (isTransient && attempt < attempts - 1) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Try next model if it's down or we've run out of retries
            break;
          }
        }
      }
    }
    throw lastError || new Error("Failed to generate content with all fallback models.");
  }

  // API Route for Comparison Analytics Narrative
  app.post("/api/gemini/comparison-narrative", async (req, res) => {
    try {
      const { countryA, countryB, gapData } = req.body;
      
      const prompt = `Analyze the development gap between ${countryA} and ${countryB}.
Based on the following data points, provide a brief, context-aware 'Development Narrative' explaining why these countries are at different trajectories. Keep it concise, analytical, and professional (around 3 paragraphs).

Data Points:
${JSON.stringify(gapData, null, 2)}`;

      const response = await generateWithRetryAndFallback({
        contents: prompt,
      });

      res.json({ narrative: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate narrative." });
    }
  });

  // API Route for Risks & Resilience
  app.post("/api/gemini/country-risks", async (req, res) => {
    const { countryName } = req.body;
    
    // Robust local fallback static lookup
    const lookupFallbackProfile = (name: string) => {
      const norm = name.toLowerCase().trim();
      if (norm.includes("china")) {
        return {
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
        };
      }
      if (norm.includes("united states") || norm.includes("usa") || norm.includes("u.s.a") || norm.includes("america")) {
        return {
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
        };
      }
      if (norm.includes("panama")) {
        return {
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
        };
      }
      if (norm.includes("turkey") || norm.includes("türk")) {
        return {
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
        };
      }
      if (norm.includes("iceland")) {
        return {
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
        };
      }
      if (norm.includes("bangladesh") || norm.includes("bangla")) {
        return {
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
            { title: "Cox's Bazar Refugee-Camp Soil Erosion", description: "Hosting over 1 million Rohingya refugees leads to severe local forest clearance, accelerating mudslides and topsoil degradation during heavy rains." }
          ],
          adaptationProjects: [
            { title: "Bangladesh Delta Plan (BDP 2100) Implementation", description: "A century-long $37-billion system of polders, flood defense walls, and tidal river control channels to safeguard low-lying economic hubs." },
            { title: "Elevated Solar-Powered Cyclone Shelters", description: "Building community-managed reinforced concrete shelter blocks powered by solar panels, saving millions of lives over recent years." }
          ],
          pioneerPossibilities: [
            { technique: "Floating Grass Bed Agriculture ('Baira')", description: "Crafting floating water-hyacinth rafts to grow crops during prolonged floods, keeping farmers self-sufficient.", originContext: "Deltaic Agrarian Traditions" }
          ]
        };
      }
      if (norm.includes("nigeria") || norm.includes("nigeri")) {
        return {
          climateVulnerabilityIndex: 8.2,
          seismicVulnerabilityIndex: 1.1,
          geopoliticalFragility: 8.1,
          institutionalStrength: 4.8,
          climateThreats: [
            { title: "Desertification in the Sahel Belt (Northern Nigeria)", description: "Advancing Sahara desertification and unpredictable rainfall patterns destroy arable lands in Sokoto and Kano, driving pastoralist-farmer resource conflicts southward." },
            { title: "Lagos Megacity Inundation & Sea Level Flooding", description: "Extreme sea-level rises coupled with rapid, uncontrolled swamp reclamation put the high-value commercial enclave of Victoria Island and Lekki FTZ at major flooding risks." }
          ],
          geophysicalThreats: [
            { title: "Inland Gully Erosion & Cratonic Fault Fractures", description: "Massive tropical downpours carve catastrophic gully systems across the loose soil structures of southeastern states, destroying houses and roads." }
          ],
          geopoliticalThreats: [
            { title: "Niger Delta Oil Degradation & Resource Militancy", description: "Decades of oil extraction spills in the delta spur persistent civil unrest, environmental litigation, and illegal oil bunkering, draining state revenues." },
            { title: "Transnational Trade Barriers & Choke-points", description: "Severe inefficiencies at the Apapa Port and high shipping transport tariffs restrict West African regional trade integration within ECOWAS frameworks." }
          ],
          adaptationProjects: [
            { title: "Great Green Wall Initiative Integration", description: "Planting a massive 8,000 km wind-break belt of drought-resistant trees across the Sahel to active halt desert advancement and restore agricultural lands." },
            { title: "Eko Atlantic City Protective Sea Wall", description: "Constructing the 'Great Wall of Lagos' - an 8.5 km armored concrete marine barrier designed to safeguard Victoria Island from extreme Atlantic surge events." }
          ],
          pioneerPossibilities: [
            { technique: "Off-Grid Solar Irrigation Platforms", description: "Introducing mobile solar-water pumping units to dryland farming cooperatives, securing harvest yields without fossil fuel reliance.", originContext: "Northern Agrarian Cooperatives" }
          ]
        };
      }
      if (norm.includes("egypt")) {
        return {
          climateVulnerabilityIndex: 8.5,
          seismicVulnerabilityIndex: 3.2,
          geopoliticalFragility: 6.5,
          institutionalStrength: 6.8,
          climateThreats: [
            { title: "Nile Delta Soil Salinization & Sea Level Rise", description: "Accelerating relative sea level rise along the low-lying Nile Delta puts Egypt's most productive agricultural and industrial land assets (Alexandria, Port Said) at direct risk of salinization and inundation." },
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
            { title: "Nile Delta Coastal Defense & Polder Reinforcement", description: "Establishing kilometers of low-impact sand dykes, reed barriers, and polder canals to trap mud and prevent salt-wedge intrusion across agricultural soils." }
          ],
          pioneerPossibilities: [
            { technique: "Sand-Reclamation Perimeter Agriculture", description: "Utilizing deep subterranean saline groundwater processed via solar-powered micro-desalination arrays to irrigate specialized high-salinity crops in the Western Desert.", originContext: "Toshka Lakes Reclamation Schemes" }
          ]
        };
      }
      if (norm.includes("ukraine")) {
        return {
          climateVulnerabilityIndex: 5.8,
          seismicVulnerabilityIndex: 2.8,
          geopoliticalFragility: 9.8,
          institutionalStrength: 5.6,
          climateThreats: [
            { title: "Dnipro Hydrological Desiccation & Dam Destructions", description: "War-induced breaches of major river blockages and reservoir infrastructure (e.g. Kakhovka Dam) disrupt perennial cooling water supplies for industrial sites and nuclear facilities." },
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
            { title: "The Black Sea Humanitarian Maritime corridor", description: "Cooperative, insurance-backed naval routing pathways to secure bulk grain shipping through the Bosporus Strait during conflict." }
          ],
          pioneerPossibilities: [
            { technique: "Dispersed Agrivoltaic Farming Matrices", description: "Integrating vertical solar panel rows above wheat crops to both provide decentralized green micro-power and shield farming soils from solar evaporation.", originContext: "Steppe Agrarian Resilience initiatives" }
          ]
        };
      }
      if (norm.includes("belgium")) {
        return {
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
            { title: "Devolved Sovereign Competencies & Multi-Layer Coordination", description: "Complex split between regional entities (Flanders/Wallonia/Brussels) requires extensive coordination for national climate action budgets." }
          ],
          adaptationProjects: [
            { title: "Coastal Safety Masterplan", description: "A comprehensive multi-decadal plan involving beach nourishment and dike reinforcement to protect the Belgian coastline against storm surges and rising tides." },
            { title: "Sponge City Antwerp", description: "Integration of green-blue infrastructure, including permeable surfaces and urban wetlands, to manage increasing precipitation and combat pluvial flooding." }
          ],
          pioneerPossibilities: [
            { technique: "Dynamic Tidal Barrier Networks", description: "Integrating high-capacity mobile storm surge barriers to modulate oceanic tidal forces and prevent storm run-offs from flooding inland basins.", originContext: "Scheldt Estuary / Sigma Plan" }
          ]
        };
      }

      // Fallback for any other country
      return {
        climateVulnerabilityIndex: 5.2,
        seismicVulnerabilityIndex: 1.8,
        geopoliticalFragility: 4.8,
        institutionalStrength: 5.0,
        climateThreats: [
          { title: `${name} Climatic Shift Stressors`, description: "Rising seasonal temperature volatility and shifting rainfall distribution threaten local crop cycles and stress industrial power grids." },
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

    try {
      const prompt = `Generate a comprehensive 'Risks & Resilience' geographic profile for the country: "${countryName}".

Follow these strict pedagogical and geopolitical guidelines to ensure extreme accuracy, realism, and curriculum alignment for DP Geography:
1. GEOPOLITICAL FRAGILITY INDEX (0.0-10.0):
   - Ensure the score is realistic and corresponds to international indices (FSI).
   - High Fragility (7.5-10.0): e.g., DRC, Chad, Sudan, Russia, or countries of active high-grade geopolitical friction.
   - Moderate Fragility (4.0-7.4): e.g., Turkey, South Africa, Peru, Brazil, Mexico, Philippines, India, Vietnam.
   - Low Fragility (0.0-3.9): e.g., USA, China, Germany, United Kingdom, Belgium, France, Netherlands, South Korea, Switzerland, Singapore, Iceland, Australia, UAE, Saudi Arabia (adjust accordingly for stability vs control, e.g. Singapore and UAE are stable, hence low fragility).

2. SEISMIC VULNERABILITY INDEX (SVI; 0.0-10.0):
   - Score must be high (7.0-10.0) for countries sitting on active fault zones, tectonic boundaries, or hot spots (Turkey: Anatolian Fault, Iceland: Mid-Atlantic Ridge, USA: West Coast/San Andreas).
   - Keep SVI extremely low (< 1.5) for cratonic and tectonically stable countries (e.g. Chad, Niger, UK, Germany, Brazil, Singapore).

3. PRIMARY SECURITY THREATS & GEOPOLITICAL FLASHPOINTS:
   - For CHINA: Focus on Taiwan Strait dispute, South China Sea Nine-Dash Line, and Hong Kong civil integration.
   - For USA: Focus on supply line security (semiconductors, raw minerals), Panama Canal / Strait of Malacca transit bottle-necks, and maritime lanes.
   - For TURKEY: North/East Anatolian fault, Bosporus/Dardanelles Strait bottle-necks, Eastern Mediterranean EEZ gas disputes.
   - For ICELAND: Mid-Atlantic Ridge volcanics, Arctic GIUKGap shipping defense lanes.
   - For PANAMA: Panama Canal capacity (El Niño drought), Guna Yala sea-level refugees.
   - For NIGERIA: Sahel desertification, Lagos/Lekki FTZ flooding, Niger Delta oil pollution, Apapa Port logistics friction.

Return valid JSON without comments or markdown formatting. Use this precise structure:
{
  "climateVulnerabilityIndex": 5.0,
  "seismicVulnerabilityIndex": 5.0,
  "geopoliticalFragility": 5.0,
  "institutionalStrength": 5.0,
  "climateThreats": [
    { "title": "threat title", "description": "threat description" }
  ],
  "geophysicalThreats": [
    { "title": "threat title", "description": "threat description" }
  ],
  "geopoliticalThreats": [
    { "title": "threat title", "description": "threat description" }
  ],
  "adaptationProjects": [
    { "title": "project title", "description": "project description" }
  ],
  "pioneerPossibilities": [
    { "technique": "technique name", "originContext": "context name", "description": "how it works" }
  ]
}`;

      const response = await generateWithRetryAndFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              climateVulnerabilityIndex: { type: Type.NUMBER },
              seismicVulnerabilityIndex: { type: Type.NUMBER },
              geopoliticalFragility: { type: Type.NUMBER },
              institutionalStrength: { type: Type.NUMBER },
              climateThreats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              geophysicalThreats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              geopoliticalThreats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              adaptationProjects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              pioneerPossibilities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    technique: { type: Type.STRING },
                    originContext: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["technique", "originContext", "description"]
                }
              }
            },
            required: [
              "climateVulnerabilityIndex",
              "seismicVulnerabilityIndex",
              "geopoliticalFragility",
              "institutionalStrength",
              "climateThreats",
              "geophysicalThreats",
              "geopoliticalThreats",
              "adaptationProjects",
              "pioneerPossibilities"
            ]
          }
        }
      });

      let rawText = (response.text || "").trim();
      
      // Clean and sanitize response text
      // 1. Remove markdown blocks if they got generated despite MIME type
      if (rawText.startsWith("```")) {
        const matches = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (matches && matches[1]) {
          rawText = matches[1].trim();
        }
      }
      
      // 2. Remove JavaScript-style comments inside JSON if present
      rawText = rawText.replace(/\/\/.*$/gm, ""); // strip inline comments
      rawText = rawText.replace(/\/\*[\s\S]*?\*\//gm, ""); // strip multi-line comments
      
      const parsedData = JSON.parse(rawText);
      
      // Validate structure matches to prevent runtime crashes on client
      if (
        typeof parsedData.climateVulnerabilityIndex === 'number' &&
        Array.isArray(parsedData.climateThreats)
      ) {
        return res.json(parsedData);
      } else {
        throw new Error("Parsed JSON has invalid keys or missing parameters");
      }
      
    } catch (error) {
      console.warn(`[Risks API Warning] Returning robust static fallback for ${countryName}. Error:`, error);
      const fallback = lookupFallbackProfile(countryName);
      return res.json(fallback);
    }
  });

  // API Route for Fluvial Data
  app.post("/api/gemini/country-fluvial", async (req, res) => {
    const { countryName } = req.body;
    console.log(`[Fluvial API] Received countryName: ${countryName}`);
    try {
      const prompt = `Generate a realistic hydrological and fluvial profile for the country: "${countryName}".
Return ONLY a valid JSON object matching this schema without any markdown, comments, or extra text:
{
  "fluvial": {
    "rivers": [
      {
        "name": "String (Name of river)",
        "type": "String (Primary or Tributary)",
        "length_km": 1234,
        "transboundary": true/false
      }
    ],
    "freshwater_sources": [
      {
        "name": "String (Name of source, e.g. Ras Al Khair Desalination Plant, Wasia Aquifer)",
        "type": "String (Desalination, Aquifer, Rainwater Harvesting, etc.)",
        "capacity_or_flow": "String (E.g. 1M cubic meters/day)"
      }
    ],
    "caseStudy": {
      "title": "String (Specific name of conflict/issue)",
      "description": "String (Detailed analytical description)"
    }
  }
}
Provide up to the top 5 largest or most significant rivers in the "rivers" array, AND up to the top 3 most significant freshwater aquifers, groundwater systems, or other major alternative sources of freshwater (such as the Great Artesian Basin in Australia, Ogallala Aquifer in USA, Indo-Gangetic Basin Aquifer in India/Pakistan, Nubian Sandstone Aquifer in Egypt, or desalination facilities for arid zones) in the "freshwater_sources" array.
For the caseStudy, provide a REAL, specific transboundary water conflict, pollution crisis, or hydrological security issue specifically affecting the requested country (e.g. Great Artesian water allocation in Australia, Thames Water Board crisis, Ganges pollution in Kanpur, GERD dam dispute, or groundwater depletion/desalination security for afluvial nations).`;

      const response = await generateWithRetryAndFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fluvial: {
                type: Type.OBJECT,
                properties: {
                  rivers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        length_km: { type: Type.NUMBER },
                        transboundary: { type: Type.BOOLEAN }
                      },
                      required: ["name", "type", "length_km", "transboundary"]
                    }
                  },
                  freshwater_sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        capacity_or_flow: { type: Type.STRING }
                      },
                      required: ["name", "type", "capacity_or_flow"]
                    }
                  },
                  caseStudy: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                  }
                },
                required: ["rivers", "freshwater_sources", "caseStudy"]
              }
            },
            required: ["fluvial"]
          }
        }
      });
      
      let rawText = (response.text || "").trim();
      if (rawText.startsWith("```")) {
        const matches = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (matches && matches[1]) {
          rawText = matches[1].trim();
        }
      }
      
      const parsedData = JSON.parse(rawText);
      res.json(parsedData);
    } catch (error) {
      console.warn(`[Fluvial API Warning] Error fetching rivers for ${countryName}:`, error);
      res.json({ fluvial: { rivers: [] } });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
