import Database from "better-sqlite3";
import { Client } from "pg";
import { MongoClient } from "mongodb";
import path from "path";

// Generic interface for database operations
export interface GlobeTubeDB {
  init(): Promise<void>;
  getVideos(includeLocked?: boolean): Promise<Record<string, any[]>>;
  saveVideos(unitTag: string, videos: any[]): Promise<void>;
  toggleLock(id: string): Promise<boolean>;
  close(): Promise<void>;
}

// 1. PostgreSQL/Supabase Client Implementation
export class PostgresGlobeTubeDB implements GlobeTubeDB {
  private client: Client;
  constructor(url: string) {
    this.client = new Client({
      connectionString: url,
      ssl: url.includes("supabase.co") || url.includes("render.com") || url.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
    });
  }

  async init() {
    await this.client.connect();
    // Create database tables for videos and week metadata if they do not exist
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS globetube_videos (
        id VARCHAR(50) PRIMARY KEY,
        title TEXT NOT NULL,
        channel TEXT NOT NULL,
        description TEXT NOT NULL,
        unit TEXT NOT NULL,
        duration VARCHAR(50) NOT NULL,
        published_at TEXT NOT NULL,
        is_locked BOOLEAN DEFAULT TRUE
      );
    `);

    await this.client.query(`
      CREATE TABLE IF NOT EXISTS globetube_week_meta (
        week VARCHAR(50) PRIMARY KEY
      );
    `);

    // Check if new table is empty, and attempt to migrate from old globetube_syllabus_rows table
    const checkVideos = await this.client.query("SELECT COUNT(*) as count FROM globetube_videos");
    const countVideos = parseInt(checkVideos.rows[0].count, 10);
    if (countVideos === 0) {
      try {
        const checkOld = await this.client.query("SELECT unit_tag, videos FROM globetube_syllabus_rows");
        console.log("[Postgres DB] Migrating old globetube_syllabus_rows data to new schema...");
        for (const row of checkOld.rows) {
          if (row.unit_tag === "week_meta") {
            try {
              const parsed = JSON.parse(row.videos);
              if (parsed && parsed.length > 0 && parsed[0].week) {
                await this.client.query("INSERT INTO globetube_week_meta (week) VALUES ($1) ON CONFLICT DO NOTHING", [parsed[0].week]);
              }
            } catch (e) {}
          } else {
            try {
              const parsedVideos = JSON.parse(row.videos);
              if (Array.isArray(parsedVideos)) {
                for (const vid of parsedVideos) {
                  await this.client.query(
                    `INSERT INTO globetube_videos (id, title, channel, description, unit, duration, published_at, is_locked)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (id) DO NOTHING`,
                    [
                      vid.id,
                      vid.title || "",
                      vid.channel || "",
                      vid.description || "",
                      vid.unit || "",
                      vid.duration || "",
                      vid.publishedAt || vid.published_at || "",
                      vid.is_locked !== undefined ? !!vid.is_locked : false
                    ]
                  );
                }
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        // Old table does not exist or empty
      }
    }
  }

  async getVideos(includeLocked?: boolean): Promise<Record<string, any[]>> {
    const query = includeLocked
      ? "SELECT id, title, channel, description, unit, duration, published_at, is_locked FROM globetube_videos"
      : "SELECT id, title, channel, description, unit, duration, published_at, is_locked FROM globetube_videos WHERE is_locked = FALSE";
    
    const res = await this.client.query(query);
    const matrix: Record<string, any[]> = {};
    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    
    prefixes.forEach((pref) => {
      matrix[pref] = [];
    });

    res.rows.forEach((row) => {
      const vid = {
        id: row.id,
        title: row.title,
        channel: row.channel,
        description: row.description,
        unit: row.unit,
        duration: row.duration,
        publishedAt: row.published_at,
        is_locked: !!row.is_locked
      };
      if (row.unit) {
        const pref = row.unit.split(':')[0].trim();
        if (matrix[pref]) {
          matrix[pref].push(vid);
        }
      }
    });

    const weekRes = await this.client.query("SELECT week FROM globetube_week_meta LIMIT 1");
    if (weekRes.rows.length > 0) {
      matrix["week_meta"] = [{ week: weekRes.rows[0].week }];
    } else {
      matrix["week_meta"] = [];
    }

    return matrix;
  }

  async saveVideos(unitTag: string, videos: any[]): Promise<void> {
    if (unitTag === "week_meta") {
      if (videos && videos.length > 0 && videos[0].week) {
        await this.client.query("DELETE FROM globetube_week_meta");
        await this.client.query("INSERT INTO globetube_week_meta (week) VALUES ($1)", [videos[0].week]);
      }
      return;
    }

    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    if (!prefixes.includes(unitTag)) {
      return;
    }

    const currentMatrix = await this.getVideos(true);
    const existingVideos = currentMatrix[unitTag] || [];
    const existingLockMap = new Map<string, boolean>();
    existingVideos.forEach((vid) => {
      existingLockMap.set(vid.id, vid.is_locked);
    });

    const incomingIds = new Set<string>();

    for (const vid of videos) {
      if (!vid.id) continue;
      incomingIds.add(vid.id);

      const isLocked = vid.is_locked !== undefined 
        ? !!vid.is_locked 
        : (existingLockMap.has(vid.id) ? existingLockMap.get(vid.id)! : false);

      await this.client.query(
        `INSERT INTO globetube_videos (id, title, channel, description, unit, duration, published_at, is_locked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) 
         DO UPDATE SET title = $2, channel = $3, description = $4, unit = $5, duration = $6, published_at = $7, is_locked = $8`,
        [
          vid.id,
          vid.title || "",
          vid.channel || "",
          vid.description || "",
          vid.unit || "",
          vid.duration || "",
          vid.publishedAt || vid.published_at || "",
          isLocked
        ]
      );
    }

    for (const oldId of existingLockMap.keys()) {
      if (!incomingIds.has(oldId)) {
        await this.client.query("DELETE FROM globetube_videos WHERE id = $1", [oldId]);
      }
    }
  }

  async toggleLock(id: string): Promise<boolean> {
    const res = await this.client.query("SELECT is_locked FROM globetube_videos WHERE id = $1", [id]);
    if (res.rows.length === 0) {
      throw new Error(`Video with ID ${id} not found.`);
    }
    const currentStatus = !!res.rows[0].is_locked;
    const newStatus = !currentStatus;
    await this.client.query("UPDATE globetube_videos SET is_locked = $1 WHERE id = $2", [newStatus, id]);
    return newStatus;
  }

  async close() {
    await this.client.end();
  }
}

// 2. MongoDB Client Implementation
export class MongoGlobeTubeDB implements GlobeTubeDB {
  private client: MongoClient;
  private dbName = "globetube";

  constructor(url: string) {
    this.client = new MongoClient(url);
    const match = url.match(/\/([^?\/]+)(\?|$)/);
    if (match && match[1]) {
      this.dbName = match[1];
    }
  }

  async init() {
    await this.client.connect();
    const db = this.client.db(this.dbName);
    
    const countVideos = await db.collection("globetube_videos").countDocuments();
    if (countVideos === 0) {
      try {
        const oldCollection = db.collection("globetube_syllabus_rows");
        const oldDocs = await oldCollection.find({}).toArray();
        if (oldDocs.length > 0) {
          console.log("[MongoDB] Migrating old globetube_syllabus_rows data to new collections...");
          for (const doc of oldDocs) {
            if (doc.unit_tag === "week_meta") {
              if (doc.videos && doc.videos.length > 0 && doc.videos[0].week) {
                await db.collection("globetube_week_meta").updateOne(
                  { week: doc.videos[0].week },
                  { $set: { week: doc.videos[0].week } },
                  { upsert: true }
                );
              }
            } else {
              if (Array.isArray(doc.videos)) {
                for (const vid of doc.videos) {
                  await db.collection("globetube_videos").updateOne(
                    { id: vid.id },
                    {
                      $set: {
                        id: vid.id,
                        title: vid.title || "",
                        channel: vid.channel || "",
                        description: vid.description || "",
                        unit: vid.unit || "",
                        duration: vid.duration || "",
                        publishedAt: vid.publishedAt || vid.published_at || "",
                        is_locked: vid.is_locked !== undefined ? !!vid.is_locked : false
                      }
                    },
                    { upsert: true }
                  );
                }
              }
            }
          }
        }
      } catch (err) {
        // Old collection or database doesn't exist
      }
    }
  }

  async getVideos(includeLocked?: boolean): Promise<Record<string, any[]>> {
    const db = this.client.db(this.dbName);
    const query = includeLocked ? {} : { is_locked: { $ne: true } };
    const docs = await db.collection("globetube_videos").find(query).toArray();
    
    const matrix: Record<string, any[]> = {};
    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    
    prefixes.forEach((pref) => {
      matrix[pref] = [];
    });

    docs.forEach((doc) => {
      const vid = {
        id: doc.id,
        title: doc.title,
        channel: doc.channel,
        description: doc.description,
        unit: doc.unit,
        duration: doc.duration,
        publishedAt: doc.publishedAt || doc.published_at,
        is_locked: !!doc.is_locked
      };
      if (doc.unit) {
        const pref = doc.unit.split(':')[0].trim();
        if (matrix[pref]) {
          matrix[pref].push(vid);
        }
      }
    });

    const weekDoc = await db.collection("globetube_week_meta").findOne({});
    if (weekDoc) {
      matrix["week_meta"] = [{ week: weekDoc.week }];
    } else {
      matrix["week_meta"] = [];
    }

    return matrix;
  }

  async saveVideos(unitTag: string, videos: any[]): Promise<void> {
    const db = this.client.db(this.dbName);
    
    if (unitTag === "week_meta") {
      if (videos && videos.length > 0 && videos[0].week) {
        await db.collection("globetube_week_meta").deleteMany({});
        await db.collection("globetube_week_meta").insertOne({ week: videos[0].week });
      }
      return;
    }

    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    if (!prefixes.includes(unitTag)) {
      return;
    }

    const currentMatrix = await this.getVideos(true);
    const existingVideos = currentMatrix[unitTag] || [];
    const existingLockMap = new Map<string, boolean>();
    existingVideos.forEach((vid) => {
      existingLockMap.set(vid.id, vid.is_locked);
    });

    const incomingIds = new Set<string>();

    for (const vid of videos) {
      if (!vid.id) continue;
      incomingIds.add(vid.id);

      const isLocked = vid.is_locked !== undefined 
        ? !!vid.is_locked 
        : (existingLockMap.has(vid.id) ? existingLockMap.get(vid.id)! : false);

      await db.collection("globetube_videos").updateOne(
        { id: vid.id },
        {
          $set: {
            id: vid.id,
            title: vid.title || "",
            channel: vid.channel || "",
            description: vid.description || "",
            unit: vid.unit || "",
            duration: vid.duration || "",
            publishedAt: vid.publishedAt || vid.published_at || "",
            is_locked: isLocked
          }
        },
        { upsert: true }
      );
    }

    for (const oldId of existingLockMap.keys()) {
      if (!incomingIds.has(oldId)) {
        await db.collection("globetube_videos").deleteOne({ id: oldId });
      }
    }
  }

  async toggleLock(id: string): Promise<boolean> {
    const db = this.client.db(this.dbName);
    const doc = await db.collection("globetube_videos").findOne({ id });
    if (!doc) {
      throw new Error(`Video with ID ${id} not found.`);
    }
    const newStatus = !doc.is_locked;
    await db.collection("globetube_videos").updateOne(
      { id },
      { $set: { is_locked: newStatus } }
    );
    return newStatus;
  }

  async close() {
    await this.client.close();
  }
}

// 3. SQLite Local Persistence Fallback (Dev/Mock Environment)
export class SqliteGlobeTubeDB implements GlobeTubeDB {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), "globetube.db");
    this.db = new Database(dbPath);
  }

  async init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS globetube_videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        channel TEXT NOT NULL,
        description TEXT NOT NULL,
        unit TEXT NOT NULL,
        duration TEXT NOT NULL,
        published_at TEXT NOT NULL,
        is_locked INTEGER DEFAULT 1
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS globetube_week_meta (
        week TEXT PRIMARY KEY
      );
    `);

    const countRow = this.db.prepare("SELECT COUNT(*) as count FROM globetube_videos").get() as { count: number };
    if (countRow.count === 0) {
      try {
        const oldRows = this.db.prepare("SELECT unit_tag, videos FROM globetube_syllabus_rows").all() as any[];
        console.log("[SQLite DB] Migrating old globetube_syllabus_rows data to new schema...");
        for (const row of oldRows) {
          if (row.unit_tag === "week_meta") {
            try {
              const parsed = JSON.parse(row.videos);
              if (parsed && parsed.length > 0 && parsed[0].week) {
                this.db.prepare("INSERT OR IGNORE INTO globetube_week_meta (week) VALUES (?)").run(parsed[0].week);
              }
            } catch (e) {}
          } else {
            try {
              const parsedVideos = JSON.parse(row.videos);
              if (Array.isArray(parsedVideos)) {
                const insert = this.db.prepare(
                  `INSERT OR IGNORE INTO globetube_videos (id, title, channel, description, unit, duration, published_at, is_locked)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                );
                for (const vid of parsedVideos) {
                  insert.run(
                    vid.id,
                    vid.title || "",
                    vid.channel || "",
                    vid.description || "",
                    vid.unit || "",
                    vid.duration || "",
                    vid.publishedAt || vid.published_at || "",
                    vid.is_locked !== undefined ? (vid.is_locked ? 1 : 0) : 0
                  );
                }
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        // Old table doesn't exist
      }
    }
  }

  async getVideos(includeLocked?: boolean): Promise<Record<string, any[]>> {
    const query = includeLocked
      ? "SELECT id, title, channel, description, unit, duration, published_at, is_locked FROM globetube_videos"
      : "SELECT id, title, channel, description, unit, duration, published_at, is_locked FROM globetube_videos WHERE is_locked = 0";
    
    const rows = this.db.prepare(query).all() as any[];
    const matrix: Record<string, any[]> = {};
    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    
    prefixes.forEach((pref) => {
      matrix[pref] = [];
    });

    rows.forEach((row) => {
      const vid = {
        id: row.id,
        title: row.title,
        channel: row.channel,
        description: row.description,
        unit: row.unit,
        duration: row.duration,
        publishedAt: row.published_at,
        is_locked: row.is_locked === 1
      };
      if (row.unit) {
        const pref = row.unit.split(':')[0].trim();
        if (matrix[pref]) {
          matrix[pref].push(vid);
        }
      }
    });

    const weekRow = this.db.prepare("SELECT week FROM globetube_week_meta LIMIT 1").get() as { week: string } | undefined;
    if (weekRow) {
      matrix["week_meta"] = [{ week: weekRow.week }];
    } else {
      matrix["week_meta"] = [];
    }

    return matrix;
  }

  async saveVideos(unitTag: string, videos: any[]): Promise<void> {
    if (unitTag === "week_meta") {
      if (videos && videos.length > 0 && videos[0].week) {
        this.db.prepare("DELETE FROM globetube_week_meta").run();
        this.db.prepare("INSERT INTO globetube_week_meta (week) VALUES (?)").run(videos[0].week);
      }
      return;
    }

    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    if (!prefixes.includes(unitTag)) {
      return;
    }

    const currentMatrix = await this.getVideos(true);
    const existingVideos = currentMatrix[unitTag] || [];
    const existingLockMap = new Map<string, boolean>();
    existingVideos.forEach((vid) => {
      existingLockMap.set(vid.id, vid.is_locked);
    });

    const incomingIds = new Set<string>();

    const insertOrUpdate = this.db.prepare(`
      INSERT INTO globetube_videos (id, title, channel, description, unit, duration, published_at, is_locked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        channel = excluded.channel,
        description = excluded.description,
        unit = excluded.unit,
        duration = excluded.duration,
        published_at = excluded.published_at,
        is_locked = excluded.is_locked
    `);

    for (const vid of videos) {
      if (!vid.id) continue;
      incomingIds.add(vid.id);

      const isLocked = vid.is_locked !== undefined 
        ? !!vid.is_locked 
        : (existingLockMap.has(vid.id) ? existingLockMap.get(vid.id)! : false);

      insertOrUpdate.run(
        vid.id,
        vid.title || "",
        vid.channel || "",
        vid.description || "",
        vid.unit || "",
        vid.duration || "",
        vid.publishedAt || vid.published_at || "",
        isLocked ? 1 : 0
      );
    }

    const deleteStmt = this.db.prepare("DELETE FROM globetube_videos WHERE id = ?");
    for (const oldId of existingLockMap.keys()) {
      if (!incomingIds.has(oldId)) {
        deleteStmt.run(oldId);
      }
    }
  }

  async toggleLock(id: string): Promise<boolean> {
    const row = this.db.prepare("SELECT is_locked FROM globetube_videos WHERE id = ?").get(id) as { is_locked: number } | undefined;
    if (!row) {
      throw new Error(`Video with ID ${id} not found.`);
    }
    const newStatus = row.is_locked === 1 ? 0 : 1;
    this.db.prepare("UPDATE globetube_videos SET is_locked = ? WHERE id = ?").run(newStatus, id);
    return newStatus === 1;
  }

  async close() {
    this.db.close();
  }
}

// Factory function to initialize the correct database driver
export async function getGlobeTubeDB(): Promise<GlobeTubeDB> {
  const url = process.env.DATABASE_URL;
  let dbInstance: GlobeTubeDB;

  if (url) {
    if (url.startsWith("mongodb://") || url.startsWith("mongodb+srv://")) {
      console.log("[GlobeTube] Database detected: MongoDB Atlas.");
      dbInstance = new MongoGlobeTubeDB(url);
    } else if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      console.log("[GlobeTube] Database detected: PostgreSQL / Supabase.");
      dbInstance = new PostgresGlobeTubeDB(url);
    } else {
      console.warn("[GlobeTube] Unsupported DATABASE_URL protocol. Falling back to SQLite.");
      dbInstance = new SqliteGlobeTubeDB();
    }
  } else {
    console.log("[GlobeTube] No DATABASE_URL set. Falling back to SQLite local persistence.");
    dbInstance = new SqliteGlobeTubeDB();
  }

  await dbInstance.init();
  return dbInstance;
}
