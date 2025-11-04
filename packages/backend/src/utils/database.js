const Database = require('better-sqlite3');
const path = require('path');

// Use persistent database file instead of in-memory
const dbPath = path.join(__dirname, '../../data/tasks.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 * Creates tasks and sub-tasks tables if they don't exist
 */
const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      dueDate TEXT,
      category TEXT NOT NULL DEFAULT 'Other',
      status INTEGER NOT NULL DEFAULT 0,
      parentTaskId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (parentTaskId) REFERENCES tasks(id) ON DELETE CASCADE,
      CHECK (status >= 0 AND status <= 100),
      CHECK (category IN ('Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'))
    );

    CREATE INDEX IF NOT EXISTS idx_parentTaskId ON tasks(parentTaskId);
    CREATE INDEX IF NOT EXISTS idx_category ON tasks(category);
    CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_dueDate ON tasks(dueDate);
    CREATE INDEX IF NOT EXISTS idx_createdAt ON tasks(createdAt);
  `);

  console.log('Database initialized at:', dbPath);
};

/**
 * Close database connection
 */
const closeDatabase = () => {
  db.close();
};

module.exports = {
  db,
  initializeDatabase,
  closeDatabase,
};
