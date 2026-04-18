PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    year INTEGER NOT NULL,
    exam_month TEXT NOT NULL CHECK (exam_month IN ('May', 'Nov', 'Specimen')),
    session_label TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('HL', 'SL')),
    timezone TEXT NOT NULL DEFAULT '',
    paper_code TEXT NOT NULL DEFAULT 'Paper 1',
    source_type TEXT NOT NULL DEFAULT 'mcq_image' CHECK (source_type IN ('mcq_image', 'structured_import')),
    source_filename TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (year, exam_month, session_label, level, timezone, paper_code, source_filename)
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    paper_id TEXT NOT NULL,
    sub_topic TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    content_markdown TEXT NOT NULL,
    has_diagram INTEGER NOT NULL DEFAULT 0 CHECK (has_diagram IN (0, 1)),
    diagram_description TEXT,
    labels_to_preserve_json TEXT NOT NULL DEFAULT '[]',
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    vibe_explanation TEXT NOT NULL,
    original_image_path TEXT,
    extraction_status TEXT NOT NULL DEFAULT 'draft' CHECK (extraction_status IN ('draft', 'reviewed', 'published')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
    FOREIGN KEY (paper_id) REFERENCES papers (id) ON DELETE CASCADE,
    UNIQUE (paper_id, question_number)
);

CREATE TABLE IF NOT EXISTS question_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL,
    option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
    option_text TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    UNIQUE (question_id, option_label),
    UNIQUE (question_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_papers_lookup
    ON papers (year, exam_month, level, timezone, paper_code);

CREATE INDEX IF NOT EXISTS idx_questions_topic
    ON questions (topic_id);

CREATE INDEX IF NOT EXISTS idx_questions_paper
    ON questions (paper_id);

CREATE INDEX IF NOT EXISTS idx_questions_status
    ON questions (extraction_status);

INSERT OR IGNORE INTO topics (id, code, name, sort_order, is_active) VALUES
    ('a4-rigid-body-mechanics', 'A4', 'Rigid Body Mechanics', 4, 1),
    ('b1-thermal-energy-transfers', 'B1', 'Thermal Energy Transfers', 11, 1),
    ('b2-greenhouse-effect', 'B2', 'Greenhouse Effect', 12, 1),
    ('b3-gas-laws', 'B3', 'Gas Laws', 13, 1),
    ('b4-thermodynamics', 'B4', 'Thermodynamics', 14, 1),
    ('b5-current-and-circuits', 'B5', 'Current and Circuits', 15, 1),
    ('c1-simple-harmonic-motion', 'C1', 'Simple Harmonic Motion', 21, 1),
    ('c2-wave-model', 'C2', 'Wave Model', 22, 1),
    ('c4-standing-waves-and-resonance', 'C4', 'Standing Waves and Resonance', 24, 1),
    ('c5-doppler-effect', 'C5', 'Doppler Effect', 25, 1);
