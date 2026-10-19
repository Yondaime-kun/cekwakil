-- Pelaporan publik: siapa pun bisa menandai entri yang keliru (model wiki).
CREATE TABLE IF NOT EXISTS laporan (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pernyataan_id INTEGER NOT NULL REFERENCES pernyataan(id) ON DELETE CASCADE,
	alasan TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'terbuka',
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_laporan_status ON laporan(status);
