import Database from 'better-sqlite3';
import path from 'path';

const dataDir = process.env.DATA_DIR || process.cwd();
const dbPath = path.join(dataDir, 'polls.db');
console.log(`[Database] Using database at: ${dbPath}`);

const db = new Database(dbPath);

export const TAG_MAPPING: Record<string, string> = {
  "PH1": "PH1: Rivers",
  "PH2": "PH2: Coasts",
  "PH3": "PH3: Ecosystems",
  "PH4": "PH4: Tectonics",
  "PH5": "PH5: Climate Change",
  "HU6": "HU6: Pop",
  "HU7": "HU7: Towns & Cities",
  "HU8": "HU8: Dev",
  "HU9": "HU9: Economies",
  "HU10": "HU10: Resources"
};

export function tagText(text: string): string[] {
  if (!text) return [];
  
  // Normalize string: lowercase and strip special characters
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);
  
  const matched: string[] = [];

  // 1. PRIMARY PASS: Hyper-dense curriculum-aligned synonym matrix
  const primaryTaxonomy = [
    {
      tag: "PH1: Rivers",
      keywords: [
        "fluvial", "hydrology", "hydrograph", "lag time", "peak discharge", "baseflow", "confluence", 
        "tributary", "tributaries", "drainage density", "abstraction", "watershed", "catchment area", "catchment", "catchments",
        "meander", "oxbow lake", "waterfall", "gorge", "canyon", "floodplain", "levee", "levees", "delta", "deltas", 
        "estuary", "v-shaped valley", "interlocking spurs", "riverbank", "braided channel",
        "inundation", "deluge", "flash flood", "flooding", "flood", "floods", "flooded",
        "hard engineering", "soft engineering", "channelization", "dams", "reservoirs", "flood walls", 
        "wing dykes", "suds", "afforestation", "floodplain zoning", "river", "rivers", "stream", "streams",
        "dam failure", "spillway overflow", "upstream runoff", "siltation"
      ]
    },
    {
      tag: "PH2: Coasts",
      keywords: [
        "longshore drift", "littoral drift", "marine erosion", "hydraulic action", "abrasion", "attrition", "solution", "corrosion",
        "destructive waves", "constructive waves", "swash", "backwash", "longshore currents", "mass movement", "slumping", "rockfall", "fetch",
        "spit", "spits", "bar", "tombolo", "salt marsh", "sand dune", "cliff profile", "wave-cut platform", "sea cave", "arch", "stack", "stump",
        "headland", "bay", "beach profile", "mangrove swamp", "coral reef", "coral reefs", "reef", "reefs", "atoll", "lagoon",
        "managed retreat", "shoreline management plan", "smp", "sea wall", "sea walls", "groynes", "rip-rap", "rock armour", "gabions",
        "beach nourishment", "dune stabilization", "cliff regrading", "marine protected areas", "mpas",
        "mangrove restoration", "reef bleaching", "rising tides", "storm surge", "coastal", "coast", "coasts", "shoreline", "shorelines", "beach", "beaches"
      ]
    },
    {
      tag: "PH3: Ecosystems",
      keywords: [
        "biome", "biomes", "biomass", "biodiversity", "gersmehl", "nutrient cycling", "nutrient cycle", "leaching", "latosol", "capillary action",
        "xerophytic", "ephemeral", "buttress roots", "drip-tips", "canopy", "canopies", "understorey", "emergent", "stratification", "trophic levels", "endemic species",
        "deforestation", "habitat fragmentation", "slash-and-burn", "monoculture", "logging", "cattle ranching", "desertification", "overgrazing", "soil degradation",
        "salinization", "bushmeat", "wildlife trafficking",
        "ecotourism", "sustainable forestry", "selective logging", "carbon offset", "carbon offsets", "biosphere reserve", "rewilding", "corridor creation", "wildlife corridor",
        "rainforest", "rainforests", "desert", "deserts", "savanna", "savannas", "savannah", "savannahs", "bush fires", "wild fires",
        "green wall", "habitat destruction", "ecosystem", "ecosystems"
      ]
    },
    {
      tag: "PH4: Tectonics",
      keywords: [
        "plate tectonics", "tectonic", "lithosphere", "asthenosphere", "convection currents", "mantle plume", "slab pull", "ridge push", "subduction zone", "benioff zone",
        "crustal rifting", "seafloor spreading",
        "destructive boundary", "constructive boundary", "conservative boundary", "collision zone", "fold mountains", "deep-sea trench", "ocean ridge", "rift valley",
        "shield volcano", "stratovolcano", "composite volcano", "caldera", "pyroclastic flow", "lahar", "ash cloud", "magma chamber",
        "epicenter", "focus", "richter scale", "mercalli scale", "moment magnitude", "seismometer",
        "seismic", "tremor", "aftershock", "tsunami", "tsunamis", "liquefaction",
        "hazard mapping", "land-use zoning", "retrofitting", "base isolation", "seismic dampers", "early-warning system", "early-warning systems", "evacuation protocol", "evacuation protocols",
        "earthquake", "earthquakes", "volcano", "volcanoes", "volcanic", "magma", "fault line", "fault lines"
      ]
    },
    {
      tag: "PH5: Climate Change",
      keywords: [
        "climate change", "climate changes", "global warming", "greenhouse effect", "greenhouse gas", "greenhouse gases",
        "carbon dioxide", "co2", "methane", "ch4", "nitrous oxide", "carbon footprint", "carbon sequestration", "carbon sink", "carbon sinks",
        "solar radiation", "albedo effect", "thermal expansion", "glacial retreat", "ice core", "milankovitch cycles",
        "climate-resilient", "climate-ready", "adaptation strategies", "adaptation strategy", "climate adaptation", "climate mitigation",
        "carbon taxation", "carbon tax", "cap-and-trade", "cop summit", "cop summits", "cop27", "cop28", "cop29", "cop30", "ipcc",
        "climate refugees", "climate refugee", "ocean acidification", "net-zero", "net zero", "carbon credit", "carbon credits", "climate pact", "decarbonization"
      ]
    },
    {
      tag: "HU6: Pop",
      keywords: [
        "demographic", "demographics", "demographic transition model", "dtm", "birth rate", "birth rates", "cbr", "death rate", "death rates", "cdr",
        "fertility rate", "fertility rates", "tfr", "infant mortality", "imr", "life expectancy", "natural increase", "natural decrease", "dependency ratio",
        "population pyramid", "ageing population", "aging population", "youth bulge", "overpopulation", "optimum population", "carrying capacity",
        "migration", "migrations", "migrating", "migrant", "migrants", "migrate", "migrated", "refugee", "refugees", "idp", "rural-to-urban", "remittances",
        "brain drain", "brain gain", "pro-natalist", "anti-natalist", "family planning", "immigration", "immigrant", "immigrants", "immigrate", "immigrated",
        "emigration", "emigrant", "emigrants", "emigrate", "emigrated", "asylum seeker", "asylum seekers", "asylum",
        "border crisis", "migrant caravan", "asylum cap", "asylum caps", "deportation", "deportations", "graying population", "pension crisis"
      ]
    },
    {
      tag: "HU7: Towns & Cities",
      keywords: [
        "urbanisation", "urbanization", "suburbanisation", "suburbanization", "counter-urbanisation", "counter-urbanization", "urban sprawl",
        "megacity", "megacities", "conurbation", "re-urbanisation", "re-urbanization", "gentrification", "urban regeneration", "brownfield", "greenfield",
        "central business district", "cbd", "inner city", "suburb", "suburbs", "transition zone", "settlement hierarchy", "sphere of influence",
        "urban heat island", "uhi", "urban microclimate",
        "shantytown", "shantytowns", "slum", "slums", "favela", "favelas", "informal settlement", "informal settlements", "squatter housing", "tenure insecurity",
        "traffic congestion", "urban smog", "waste management", "mass transit", "smart cities", "smart city", "congestion charging", "city", "cities", "urban"
      ]
    },
    {
      tag: "HU8: Dev",
      keywords: [
        "gross national income", "gni", "human development index", "hdi", "gross domestic product", "gdp", "purchasing power parity", "ppp",
        "literacy rate", "gini coefficient", "core-periphery", "brandt line", "global north", "global south", "ldcs", "nics",
        "bilateral aid", "multilateral aid", "ngo", "ngos", "microfinance", "microcredit", "foreign direct investment", "fdi",
        "fair trade", "free trade", "trade barriers", "tariffs", "quota", "quotas", "structural adjustment", "debt relief", "poverty",
        "wealth inequality", "humanitarian assistance", "standard of living"
      ]
    },
    {
      tag: "HU9: Economies",
      keywords: [
        "primary sector", "secondary sector", "teriary sector", "tertiary sector", "quaternary sector", "employment structure", "industrial sector",
        "globalisation", "globalization", "deindustrialisation", "deindustrialization", "outsourcing", "offshoring", "global shift",
        "transnational corporation", "tnc", "tncs", "multinational corporation", "mnc", "mncs", "special economic zone", "sezs", "export processing zone", "epzs",
        "supply chain", "just-in-time", "logistics hub", "logistics hubs", "containerisation", "containerization", "automation", "labor exploitation",
        "sweatshop", "sweatshops", "trade bloc", "trade blocs",
        "factory relocation", "job outsourcing", "manufacturing powerhouse", "logistics bottlenecks", "manufacturing", "manufacture"
      ]
    },
    {
      tag: "HU10: Resources",
      keywords: [
        "energy security", "energy mix", "food security", "food supply", "food supplies", "renewable", "renewables",
        "water scarcity", "water scarce", "drought", "droughts", "crop yield", "crop yields", "agriculture", "agricultural",
        "minerals", "mineral", "mining", "resource depletion", "depleted resources",
        "oil supply", "coal supply", "gas supply", "water supply", "power grid", "water rationing", "wheat shortages"
      ]
    }
  ];

  for (const { tag, keywords } of primaryTaxonomy) {
    const hasKeyword = keywords.some(keyword => {
      if (keyword.includes(" ")) {
        return normalized.includes(keyword);
      }
      return words.includes(keyword);
    });
    if (hasKeyword) {
      matched.push(tag);
    }
  }

  return matched;
}

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    question TEXT NOT NULL,
    source_url TEXT,
    dp_tag TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS poll_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id INTEGER NOT NULL,
    selected_option TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id)
  );

  CREATE TABLE IF NOT EXISTS user_votes_tracker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id INTEGER NOT NULL,
    user_identifier TEXT NOT NULL,
    selected_option TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_identifier),
    FOREIGN KEY (poll_id) REFERENCES polls(id)
  );

  -- Migration: Add selected_option if it doesn't exist (handle already existing table)
  PRAGMA table_info(user_votes_tracker);
`);

// Add column if missing (simple migration)
const columns = db.prepare('PRAGMA table_info(user_votes_tracker)').all() as any[];
const hasSelectedOption = columns.some(c => c.name === 'selected_option');
if (!hasSelectedOption) {
  db.exec('ALTER TABLE user_votes_tracker ADD COLUMN selected_option TEXT');
}

export function getPollDateKST(): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const kstYear = kstTime.getUTCFullYear();
  const kstMonth = kstTime.getUTCMonth();
  const kstDay = kstTime.getUTCDate();
  
  const kstBoundary = new Date(Date.UTC(kstYear, kstMonth, kstDay, 7, 45, 0, 0));
  
  let pollDate = kstTime;
  if (kstTime.getTime() < kstBoundary.getTime()) {
    pollDate = new Date(kstTime.getTime() - 24 * 60 * 60 * 1000);
  }
  
  const year = pollDate.getUTCFullYear();
  const month = String(pollDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(pollDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayPolls(userIdentifier: string) {
  const today = getPollDateKST();
  
  // Seed default polls for today if none exist yet
  try {
    seedPollsIfEmpty(today);
  } catch (err) {
    console.error("Error auto-seeding polls:", err);
  }

  console.log(`[Polls] Fetching polls for date: ${today}`);
  
  const polls = db.prepare('SELECT * FROM polls WHERE date = ?').all(today) as any[];
  console.log(`[Polls] Found ${polls.length} polls in database.`);

  return polls.map(poll => {
    // Dynamic tagging
    let tags = tagText(poll.question);
    
    // If no keyword matched, try matching the poll's existing dp_tag
    if (tags.length === 0) {
      if (poll.dp_tag) {
        const cleanDbTag = poll.dp_tag.trim();
        const mapped = TAG_MAPPING[cleanDbTag] || Object.values(TAG_MAPPING).find(val => 
          val.toLowerCase() === cleanDbTag.toLowerCase() || 
          val.toLowerCase().startsWith(cleanDbTag.toLowerCase() + ":")
        );
        if (mapped) {
          tags = [mapped];
        }
      }
    }
    
    const hashtags = tags.map(t => `#${t}`).join(' ');
    
    // Clean any existing hashtags first to avoid duplicating them
    const cleanQuestion = poll.question.replace(/#\w+:\s*[^#]+/g, '').trim();
    const finalQuestion = hashtags ? `${cleanQuestion} ${hashtags}` : cleanQuestion;

    const votes = db.prepare(`
      SELECT selected_option, COUNT(*) as count 
      FROM poll_votes 
      WHERE poll_id = ? 
      GROUP BY selected_option
    `).all(poll.id) as { selected_option: string, count: number }[];

    const results = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      total: 0
    };

    votes.forEach(v => {
      // @ts-ignore
      results[v.selected_option] = v.count;
      results.total += v.count;
    });

    const userVote = db.prepare('SELECT selected_option FROM user_votes_tracker WHERE poll_id = ? AND user_identifier = ?')
      .get(poll.id, userIdentifier) as { selected_option: string } | undefined;

    return {
      ...poll,
      question: finalQuestion,
      dp_tag: tags[0],
      hasVoted: !!userVote,
      userSelection: userVote?.selected_option,
      results
    };
  });
}

export function castVote(pollId: number, option: string, userIdentifier: string) {
  const transaction = db.transaction(() => {
    // Check if duplicate
    const existing = db.prepare('SELECT id FROM user_votes_tracker WHERE poll_id = ? AND user_identifier = ?')
      .get(pollId, userIdentifier);
    
    if (existing) {
      throw new Error('Already voted');
    }

    // Insert vote
    db.prepare('INSERT INTO poll_votes (poll_id, selected_option) VALUES (?, ?)').run(pollId, option);
    
    // Track user
    db.prepare('INSERT INTO user_votes_tracker (poll_id, user_identifier, selected_option) VALUES (?, ?, ?)').run(pollId, userIdentifier, option);

    // Get updated results
    const votes = db.prepare(`
      SELECT selected_option, COUNT(*) as count 
      FROM poll_votes 
      WHERE poll_id = ? 
      GROUP BY selected_option
    `).all(pollId) as { selected_option: string, count: number }[];

    const results = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      total: 0
    };

    votes.forEach(v => {
      // @ts-ignore
      results[v.selected_option] = v.count;
      results.total += v.count;
    });

    return results;
  });

  return transaction();
}

function seedPollsIfEmpty(date: string) {
  const count = db.prepare('SELECT COUNT(*) as count FROM polls WHERE date = ?').get(date) as { count: number };
  
  if (count.count === 0) {
    const polls = [
      {
        date,
        question: "Which of the following is the primary driver of the 'Urban Heat Island' effect in mega-cities?",
        source_url: "https://www.theguardian.com/environment",
        dp_tag: "HU7: Towns & Cities",
        option_a: "Albedo reduction due to concrete/asphalt",
        option_b: "Increased agricultural runoff",
        option_c: "Geophysical hazard vulnerability",
        option_d: "Coastal erosion factors"
      },
      {
        date,
        question: "How has global fertility shifted in middle-income countries according to recent demographic reports?",
        source_url: "https://www.economist.com/international",
        dp_tag: "HU6: Pop",
        option_a: "Rapid increase above replacement level",
        option_b: "Consistent decline toward aging population structures",
        option_c: "No change over the last 30 years",
        option_d: "Hyper-growth in rural agricultural sectors"
      },
      {
        date,
        question: "What is the main concern regarding 'Rare Earth Elements' in global supply chain security?",
        source_url: "https://www.ft.com/global-economy",
        dp_tag: "HU10: Resources",
        option_a: "Oversupply leading to price crashes",
        option_b: "Geopolitical concentration of extraction/processing",
        option_c: "Lack of use in renewable energy hardware",
        option_d: "High water footprint of solar panels"
      }
    ];

    const insert = db.prepare(`
      INSERT INTO polls (date, question, source_url, dp_tag, option_a, option_b, option_c, option_d)
      VALUES (@date, @question, @source_url, @dp_tag, @option_a, @option_b, @option_c, @option_d)
    `);

    for (const poll of polls) {
      insert.run(poll);
    }
  }
}

export function hasPollsForToday(): boolean {
  const today = getPollDateKST();
  const count = db.prepare('SELECT COUNT(*) as count FROM polls WHERE date = ?').get(today) as { count: number };
  return count.count > 0;
}

export function savePolls(polls: any[]) {
  const insert = db.prepare(`
    INSERT INTO polls (date, question, source_url, dp_tag, option_a, option_b, option_c, option_d)
    VALUES (@date, @question, @source_url, @dp_tag, @option_a, @option_b, @option_c, @option_d)
  `);

  const transaction = db.transaction((pollsToSave) => {
    for (const poll of pollsToSave) {
      insert.run(poll);
    }
  });

  transaction(polls);
}

export default db;
