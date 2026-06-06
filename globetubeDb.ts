import Database from "better-sqlite3";
import { Client } from "pg";
import { MongoClient } from "mongodb";
import path from "path";

// Generic interface for database operations
export interface GlobeTubeDB {
  init(): Promise<void>;
  getVideos(): Promise<Record<string, any[]>>;
  saveVideos(unitTag: string, videos: any[]): Promise<void>;
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
    // Create database table for 9 syllabus units if it does not exist
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS globetube_syllabus_rows (
        unit_tag VARCHAR(50) PRIMARY KEY,
        videos TEXT NOT NULL
      );
    `);

    // Check if the table is completely empty on startup, automatically seed with empty arrays
    const res = await this.client.query("SELECT COUNT(*) as count FROM globetube_syllabus_rows");
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0) {
      const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
      for (const pref of prefixes) {
        await this.client.query(
          "INSERT INTO globetube_syllabus_rows (unit_tag, videos) VALUES ($1, $2)",
          [pref, "[]"]
        );
      }
      console.log("[Postgres DB] Seeded 9 syllabus rows with empty arrays.");
    }
  }

  async getVideos(): Promise<Record<string, any[]>> {
    const res = await this.client.query("SELECT unit_tag, videos FROM globetube_syllabus_rows");
    const matrix: Record<string, any[]> = {};
    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    
    // Default matrix initialization
    prefixes.forEach((pref) => {
      matrix[pref] = [];
    });

    res.rows.forEach((row) => {
      try {
        matrix[row.unit_tag] = JSON.parse(row.videos);
      } catch (e) {
        matrix[row.unit_tag] = [];
      }
    });

    return matrix;
  }

  async saveVideos(unitTag: string, videos: any[]): Promise<void> {
    await this.client.query(
      `INSERT INTO globetube_syllabus_rows (unit_tag, videos) 
       VALUES ($1, $2) 
       ON CONFLICT (unit_tag) 
       DO UPDATE SET videos = $2`,
      [unitTag, JSON.stringify(videos)]
    );
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
    const collection = db.collection("globetube_syllabus_rows");
    
    const count = await collection.countDocuments();
    if (count === 0) {
      const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
      const docs = prefixes.map((pref) => ({ unit_tag: pref, videos: [] }));
      await collection.insertMany(docs);
      console.log("[MongoDB] Seeded 9 syllabus rows with empty arrays.");
    }
  }

  async getVideos(): Promise<Record<string, any[]>> {
    const db = this.client.db(this.dbName);
    const collection = db.collection("globetube_syllabus_rows");
    const docs = await collection.find({}).toArray();
    
    const matrix: Record<string, any[]> = {};
    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    
    prefixes.forEach((pref) => {
      matrix[pref] = [];
    });

    docs.forEach((doc) => {
      matrix[doc.unit_tag] = Array.isArray(doc.videos) ? doc.videos : [];
    });

    return matrix;
  }

  async saveVideos(unitTag: string, videos: any[]): Promise<void> {
    const db = this.client.db(this.dbName);
    const collection = db.collection("globetube_syllabus_rows");
    await collection.updateOne(
      { unit_tag: unitTag },
      { $set: { videos } },
      { upsert: true }
    );
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
      CREATE TABLE IF NOT EXISTS globetube_syllabus_rows (
        unit_tag TEXT PRIMARY KEY,
        videos TEXT NOT NULL
      );
    `);

    const countRow = this.db.prepare("SELECT COUNT(*) as count FROM globetube_syllabus_rows").get() as { count: number };
    if (countRow.count === 0) {
      const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
      const insert = this.db.prepare("INSERT INTO globetube_syllabus_rows (unit_tag, videos) VALUES (?, ?)");
      for (const pref of prefixes) {
        insert.run(pref, "[]");
      }
      console.log("[SQLite DB] Seeded 9 syllabus rows with empty arrays.");
    }
  }

  async getVideos(): Promise<Record<string, any[]>> {
    const rows = this.db.prepare("SELECT unit_tag, videos FROM globetube_syllabus_rows").all() as any[];
    const matrix: Record<string, any[]> = {};
    const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
    
    prefixes.forEach((pref) => {
      matrix[pref] = [];
    });

    rows.forEach((row) => {
      try {
        matrix[row.unit_tag] = JSON.parse(row.videos);
      } catch (e) {
        matrix[row.unit_tag] = [];
      }
    });

    return matrix;
  }

  async saveVideos(unitTag: string, videos: any[]): Promise<void> {
    this.db.prepare(`
      INSERT INTO globetube_syllabus_rows (unit_tag, videos) 
      VALUES (?, ?) 
      ON CONFLICT(unit_tag) DO UPDATE SET videos = excluded.videos
    `).run(unitTag, JSON.stringify(videos));
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
