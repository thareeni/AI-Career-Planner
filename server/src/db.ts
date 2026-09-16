import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

let pgPool: pg.Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlitePath = path.join(dataDir, "planner.db");

if (DATABASE_URL && DATABASE_URL.startsWith("postgres")) {
  console.log("🐘 Connecting to PostgreSQL database...");
  pgPool = new pg.Pool({ connectionString: DATABASE_URL });
} else {
  console.log(`📁 Connecting to SQLite database at ${sqlitePath}...`);
  sqliteDb = new sqlite3.Database(sqlitePath);
}

// Database Helper Interface
export const db = {
  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    if (pgPool) {
      let pgSql = sql;
      let paramCount = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramCount++}`);
      const res = await pgPool.query(pgSql, params);
      return { lastID: res.rows[0]?.id || 0, changes: res.rowCount || 0 };
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  },

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (pgPool) {
      let pgSql = sql;
      let paramCount = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramCount++}`);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] as T;
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row as T);
        });
      });
    }
  },

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (pgPool) {
      let pgSql = sql;
      let paramCount = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramCount++}`);
      const res = await pgPool.query(pgSql, params);
      return res.rows as T[];
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb!.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows as T[]);
        });
      });
    }
  }
};

export async function initDatabase() {
  console.log("⚙️ Initializing database tables...");

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );
  `;

  const profilesTable = `
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      full_name TEXT,
      display_name TEXT NOT NULL,
      education TEXT,
      degree TEXT,
      experience_level TEXT,
      skills TEXT,
      interests TEXT,
      target_career TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const careerPlansTable = `
    CREATE TABLE IF NOT EXISTS career_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      career_title TEXT NOT NULL,
      overview TEXT,
      required_skills TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const roadmapStagesTable = `
    CREATE TABLE IF NOT EXISTS roadmap_stages (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      stage_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES career_plans(id) ON DELETE CASCADE
    );
  `;

  const roadmapTopicsTable = `
    CREATE TABLE IF NOT EXISTS roadmap_topics (
      id TEXT PRIMARY KEY,
      stage_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (stage_id) REFERENCES roadmap_stages(id) ON DELETE CASCADE
    );
  `;

  const learningResourcesTable = `
    CREATE TABLE IF NOT EXISTS learning_resources (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT NOT NULL,
      thumbnail TEXT,
      channel_title TEXT,
      duration TEXT,
      url TEXT,
      FOREIGN KEY (topic_id) REFERENCES roadmap_topics(id) ON DELETE CASCADE
    );
  `;

  const videoProgressTable = `
    CREATE TABLE IF NOT EXISTS video_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      watched_seconds INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      percentage INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, topic_id, video_id)
    );
  `;

  const taskProgressTable = `
    CREATE TABLE IF NOT EXISTS task_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, topic_id)
    );
  `;

  const customGoalsTable = `
    CREATE TABLE IF NOT EXISTS custom_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES career_plans(id) ON DELETE CASCADE
    );
  `;

  await db.run(usersTable);
  await db.run(profilesTable);
  await db.run(careerPlansTable);
  await db.run(roadmapStagesTable);
  await db.run(roadmapTopicsTable);
  await db.run(learningResourcesTable);
  await db.run(videoProgressTable);
  await db.run(taskProgressTable);
  await db.run(customGoalsTable);

  console.log("✅ Database schema initialized successfully.");
}
