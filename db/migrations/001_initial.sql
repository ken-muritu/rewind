-- Rewind schema for Turso (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  avatar_type TEXT DEFAULT 'default',
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reflections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT 2025,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reflection_answers (
  id TEXT PRIMARY KEY,
  reflection_id TEXT NOT NULL REFERENCES reflections(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(reflection_id, question_id)
);

CREATE TABLE IF NOT EXISTS blueprints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reflection_id TEXT REFERENCES reflections(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, reflection_id)
);

CREATE TABLE IF NOT EXISTS blueprint_notes (
  id TEXT PRIMARY KEY,
  blueprint_id TEXT NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blueprint_reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  is_active INTEGER NOT NULL DEFAULT 1,
  last_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blueprint_goals (
  id TEXT PRIMARY KEY,
  blueprint_id TEXT NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started',
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_year ON reflections(user_id, year);
CREATE INDEX IF NOT EXISTS idx_reflection_answers_reflection ON reflection_answers(reflection_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_user ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_goals_blueprint ON blueprint_goals(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_notes_blueprint ON blueprint_notes(blueprint_id);
