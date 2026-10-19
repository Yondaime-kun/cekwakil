-- CekWakil schema (D1 / SQLite)

CREATE TABLE IF NOT EXISTS pejabat (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nama TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	jabatan TEXT NOT NULL,
	instansi TEXT NOT NULL DEFAULT 'DPR RI',
	partai TEXT,
	dapil TEXT,
	komisi TEXT,
	suara INTEGER,
	foto_url TEXT,
	wikipedia_url TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pernyataan (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pejabat_id INTEGER NOT NULL REFERENCES pejabat(id) ON DELETE CASCADE,
	isi TEXT NOT NULL,
	konteks TEXT NOT NULL DEFAULT '',
	kategori TEXT NOT NULL,
	sumber_url TEXT NOT NULL,
	tanggal TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','pending','rejected'))
);

CREATE TABLE IF NOT EXISTS submissions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pejabat_id INTEGER REFERENCES pejabat(id),
	nama_pejabat_baru TEXT,
	isi TEXT NOT NULL,
	konteks TEXT NOT NULL DEFAULT '',
	kategori TEXT NOT NULL,
	sumber_url TEXT NOT NULL,
	tanggal TEXT NOT NULL,
	submitter TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
	review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_pernyataan_pejabat ON pernyataan(pejabat_id);
CREATE INDEX IF NOT EXISTS idx_pernyataan_status ON pernyataan(status);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
