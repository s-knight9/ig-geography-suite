-- SQL DDL for Daily Geography News Polls

-- Store poll metadata
CREATE TABLE IF NOT EXISTS polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    question TEXT NOT NULL,
    source_url TEXT,
    dp_tag TEXT, -- IB Geography unit tag (e.g., SL1, HL4)
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Store individual votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id INTEGER NOT NULL,
    selected_option TEXT NOT NULL, -- 'A', 'B', 'C', or 'D'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id)
);

-- Track user interactions to prevent double voting
CREATE TABLE IF NOT EXISTS user_votes_tracker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id INTEGER NOT NULL,
    user_identifier TEXT NOT NULL, -- IP Hash or Session ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_identifier),
    FOREIGN KEY (poll_id) REFERENCES polls(id)
);

-- Index for date-based lookups
CREATE INDEX IF NOT EXISTS idx_polls_date ON polls(date);
