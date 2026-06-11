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
  const taxonomy = [
    {
      tag: "PH1: Rivers",
      keywords: [
        "flooding", "flood", "floods", "flooded",
        "catchment", "catchments",
        "drainage basin", "drainage basins",
        "delta", "deltas",
        "channel", "channels",
        "levee", "levees",
        "river", "rivers",
        "stream", "streams",
        "tributary", "tributaries",
        "fluvial", "hydrological"
      ]
    },
    {
      tag: "PH2: Coasts",
      keywords: [
        "spit", "spits",
        "erosion", "eroded", "eroding",
        "longshore drift",
        "coral reef", "coral reefs", "reef", "reefs",
        "cliff", "cliffs",
        "beach", "beaches",
        "marine",
        "coastal", "coast", "coasts",
        "shoreline", "shorelines",
        "wave", "waves"
      ]
    },
    {
      tag: "PH3: Ecosystems",
      keywords: [
        "rainforest", "rainforests",
        "desert", "deserts",
        "biodiversity",
        "canopy", "canopies",
        "savanna", "savannas", "savannah", "savannahs",
        "biome", "biomes",
        "deforestation", "ecosystem", "ecosystems",
        "nutrient cycle", "nutrient cycles"
      ]
    },
    {
      tag: "PH4: Tectonics",
      keywords: [
        "earthquake", "earthquakes",
        "volcano", "volcanoes", "volcanic",
        "seismic",
        "magma",
        "plate boundary", "plate boundaries",
        "tsunami", "tsunamis",
        "fault line", "tectonic"
      ]
    },
    {
      tag: "PH5: Climate Change",
      keywords: [
        "climate change", "climate changes",
        "global warming",
        "greenhouse effect", "greenhouse gas", "greenhouse gases",
        "carbon budget", "carbon budgets",
        "climate treaty", "climate treaties",
        "paris agreement", "kyoto protocol",
        "cop27", "cop28", "cop29", "cop30",
        "climate shift", "climate shifts",
        "climate attribution", "attribution study", "attribution studies",
        "decarbonization", "net zero"
      ]
    },
    {
      tag: "HU6: Pop",
      keywords: [
        "migration", "migrations", "migrant", "migrants", "migrate", "migrated",
        "refugee", "refugees",
        "birth rate", "birth rates",
        "death rate", "death rates",
        "dtm",
        "ageing", "aging", "aged", "elderly",
        "fertility",
        "overpopulation", "overpopulated",
        "demographic", "demographics",
        "natalist", "population growth"
      ]
    },
    {
      tag: "HU7: Towns & Cities",
      keywords: [
        "urban", "urbanisation", "urbanization",
        "megacity", "megacities",
        "sprawl", "sprawls", "sprawling",
        "settlement hierarchy", "settlement", "settlements",
        "favela", "favelas", "slum", "slums",
        "regeneration", "regenerate", "regenerated",
        "city", "cities",
        "suburb", "suburbs", "suburbanization",
        "gentrification", "shantytown", "shantytowns"
      ]
    },
    {
      tag: "HU8: Dev",
      keywords: [
        "hdi",
        "gni",
        "wealth gap", "wealth gaps",
        "foreign aid",
        "trade bloc", "trade blocs",
        "inequality", "inequalities",
        "development", "develop", "developing", "developed",
        "underdeveloped", "poverty", "aid agency"
      ]
    },
    {
      tag: "HU9: Economies",
      keywords: [
        "tnc", "tncs",
        "globalisation", "globalization",
        "industrial sector", "industrial sectors", "industry", "industries", "industrial",
        "employment", "employ", "employment",
        "manufacturing", "manufacture", "manufactured",
        "financial", "finance",
        "supply chain", "multinational"
      ]
    },
    {
      tag: "HU10: Resources",
      keywords: [
        "energy security", "energy mix",
        "food security", "food supply", "food supplies",
        "renewable", "renewables",
        "water scarcity", "water scarce", "drought", "droughts",
        "crop yield", "crop yields", "agriculture", "agricultural",
        "minerals", "mineral", "mining",
        "resource depletion", "depleted resources",
        "oil supply", "coal supply", "gas supply", "water supply"
      ]
    }
  ];

  for (const { tag, keywords } of taxonomy) {
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
