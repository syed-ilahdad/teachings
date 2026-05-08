-- Categories (with optional cover image)
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  name        TEXT     NOT NULL UNIQUE,
  description TEXT,
  cover_key   TEXT,                          -- R2 key for cover image
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Files (with optional cover image)
CREATE TABLE IF NOT EXISTS files (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  filename      TEXT     NOT NULL,
  original_name TEXT     NOT NULL,
  file_type     TEXT     NOT NULL,           -- audio | video | pdf
  file_size     INTEGER  NOT NULL,
  category_id   INTEGER,
  r2_key        TEXT     NOT NULL,
  cover_key     TEXT,                        -- R2 key for file cover art
  mime_type     TEXT,
  is_featured   INTEGER  DEFAULT 0,          -- shown in Important section
  upload_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  username      TEXT     NOT NULL UNIQUE,
  password_hash TEXT     NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page sections (the user page layout, published by admin)
-- Each row is one section block. `order_index` controls position.
-- `config` is a JSON string: { title, type, filter, limit }
-- type can be: "important" | "latest" | "must_watch" | "category" | "audio" | "video" | "pdf" | "custom"
CREATE TABLE IF NOT EXISTS page_sections (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  title       TEXT     NOT NULL,
  section_type TEXT    NOT NULL,
  order_index INTEGER  NOT NULL DEFAULT 0,
  config      TEXT     NOT NULL DEFAULT '{}',
  is_active   INTEGER  DEFAULT 1,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default sections (seeded)
INSERT OR IGNORE INTO page_sections (id, title, section_type, order_index, config)
VALUES
  (1, 'Important',   'important',  0, '{"limit":12}'),
  (2, 'Latest',      'latest',     1, '{"limit":12}'),
  (3, 'Must Watch',  'must_watch', 2, '{"limit":12}'),
  (4, 'Categories',  'categories', 3, '{"limit":20}'),
  (5, 'All Audio',   'audio',      4, '{"limit":50}'),
  (6, 'All Videos',  'video',      5, '{"limit":50}'),
  (7, 'All PDFs',    'pdf',        6, '{"limit":50}');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_files_category  ON files(category_id);
CREATE INDEX IF NOT EXISTS idx_files_type      ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_featured  ON files(is_featured);
CREATE INDEX IF NOT EXISTS idx_files_name      ON files(original_name ASC);
CREATE INDEX IF NOT EXISTS idx_files_date      ON files(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_sections_order  ON page_sections(order_index ASC);