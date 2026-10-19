-- Kasus korupsi: arsip per pejabat, dengan sumber berita.
CREATE TABLE IF NOT EXISTS kasus_korupsi (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pejabat_id INTEGER NOT NULL REFERENCES pejabat(id) ON DELETE CASCADE,
	nama_kasus TEXT NOT NULL,
	peran TEXT,               -- terdakwa / tersangka / terpidana / saksi / dikaitkan
	nominal_rp INTEGER,       -- nilai dalam rupiah
	status TEXT,              -- proses hukum: penyelidikan / sidang / vonis / bebas
	tahun INTEGER,
	sumber_url TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
