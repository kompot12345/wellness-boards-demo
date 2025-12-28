import Database from "better-sqlite3";

const db = new Database("wellness.db");

// PROFILES TABLE
db.prepare(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    goal TEXT NOT NULL,
    injury TEXT,
    height INTEGER,
    weight INTEGER,
    age INTEGER,
    created_at TEXT NOT NULL
  )
`).run();

// PLANNER TABLE
db.prepare(`
  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    date TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )
`).run();

export default db;
