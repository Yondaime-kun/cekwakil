-- Profil pejabat bisa diperkaya publik, ala wiki.
ALTER TABLE pejabat ADD COLUMN bio TEXT;
ALTER TABLE pejabat ADD COLUMN sumber_bio TEXT;

-- Riwayat skandal/kasus non-korupsi (profil, bukan pernyataan).
CREATE TABLE IF NOT EXISTS rekam_jejak (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pejabat_id INTEGER NOT NULL REFERENCES pejabat(id) ON DELETE CASCADE,
	judul TEXT NOT NULL,
	uraian TEXT,
	tahun INTEGER,
	sumber_url TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'published',
	reverted_at TEXT,
	revert_reason TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rekam_pejabat ON rekam_jejak(pejabat_id);

-- Normalisasi nama untuk dedupe: nama tanpa gelar & tanda baca.
CREATE TABLE IF NOT EXISTS pejabat_nama_norm (
	pejabat_id INTEGER PRIMARY KEY REFERENCES pejabat(id) ON DELETE CASCADE,
	nama_norm TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_norm_nama ON pejabat_nama_norm(nama_norm);
