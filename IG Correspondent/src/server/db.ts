import Database from 'better-sqlite3';
import path from 'path';

const dataDir = process.env.DATA_DIR || process.cwd();
const dbPath = path.join(dataDir, 'polls.db');
console.log(`[Database] Using database at: ${dbPath}`);

const db = new Database(dbPath);

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
        dp_tag: "HU7",
        option_a: "Albedo reduction due to concrete/asphalt",
        option_b: "Increased agricultural runoff",
        option_c: "Geophysical hazard vulnerability",
        option_d: "Coastal erosion factors"
      },
      {
        date,
        question: "How has global fertility shifted in middle-income countries according to recent demographic reports?",
        source_url: "https://www.economist.com/international",
        dp_tag: "HU6",
        option_a: "Rapid increase above replacement level",
        option_b: "Consistent decline toward aging population structures",
        option_c: "No change over the last 30 years",
        option_d: "Hyper-growth in rural agricultural sectors"
      },
      {
        date,
        question: "What is the main concern regarding 'Rare Earth Elements' in global supply chain security?",
        source_url: "https://www.ft.com/global-economy",
        dp_tag: "HU10",
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
