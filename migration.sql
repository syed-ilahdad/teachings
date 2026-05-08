-- migration.sql  (run: wrangler d1 execute library-db --remote --file=migration.sql)

-- ── Core tables ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT,
  cover_key   TEXT,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author      TEXT,
  tags        TEXT    DEFAULT '[]',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name  TEXT    NOT NULL,
  title          TEXT,
  description    TEXT,
  author         TEXT,
  tags           TEXT    DEFAULT '[]',
  file_type      TEXT    NOT NULL,
  file_size      INTEGER NOT NULL,
  category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  r2_key         TEXT    NOT NULL,
  cover_key      TEXT,
  mime_type      TEXT,
  is_featured    INTEGER DEFAULT 0,
  is_latest      INTEGER DEFAULT 0,
  is_must_watch  INTEGER DEFAULT 0,
  upload_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_label     TEXT
);

CREATE TABLE IF NOT EXISTS page_sections (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  section_type TEXT    NOT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0,
  config       TEXT    NOT NULL DEFAULT '{}',
  is_active    INTEGER DEFAULT 1,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  description  TEXT,
  file_id      INTEGER REFERENCES files(id) ON DELETE SET NULL,
  author       TEXT,
  is_active    INTEGER DEFAULT 1,
  order_index  INTEGER DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Add columns to existing tables safely ───────────────────
ALTER TABLE files ADD COLUMN title TEXT;
ALTER TABLE files ADD COLUMN description TEXT;
ALTER TABLE files ADD COLUMN author TEXT;
ALTER TABLE files ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE files ADD COLUMN is_latest INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN is_must_watch INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN date_label TEXT;
ALTER TABLE categories ADD COLUMN slug TEXT;
ALTER TABLE categories ADD COLUMN author TEXT;
ALTER TABLE categories ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE categories ADD COLUMN parent_id INTEGER;

-- ── Update existing categories to have a slug ────────────────
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- ── Default page sections ────────────────────────────────────
INSERT OR IGNORE INTO page_sections (id, title, section_type, order_index, config, is_active) VALUES
  (1, 'Important Updates', 'important',  0, '{"limit":12}', 1),
  (2, 'Latest Releases',   'latest',     1, '{"limit":12}', 1),
  (3, 'Must Watch',        'must_watch', 2, '{"limit":12}', 1),
  (4, 'Categories',        'categories', 3, '{"limit":20}', 1),
  (5, 'All Audio',         'audio',      4, '{"limit":50}', 1),
  (6, 'All Videos',        'video',      5, '{"limit":50}', 1),
  (7, 'All PDFs',          'pdf',        6, '{"limit":50}', 1);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_files_type      ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_featured  ON files(is_featured);
CREATE INDEX IF NOT EXISTS idx_files_latest    ON files(is_latest);
CREATE INDEX IF NOT EXISTS idx_files_mustwatch ON files(is_must_watch);
CREATE INDEX IF NOT EXISTS idx_files_category  ON files(category_id);
CREATE INDEX IF NOT EXISTS idx_files_date      ON files(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_files_name      ON files(original_name ASC);
CREATE INDEX IF NOT EXISTS idx_cats_parent     ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_cats_slug       ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_news_order      ON news(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_sections_order  ON page_sections(order_index ASC);