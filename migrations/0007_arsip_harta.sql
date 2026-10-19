-- Arsip sumber: simpan snapshot Wayback + harta kekayaan (LHKPN)
ALTER TABLE pernyataan ADD COLUMN arsip_url TEXT;
ALTER TABLE kasus_korupsi ADD COLUMN arsip_url TEXT;
ALTER TABLE submissions ADD COLUMN arsip_url TEXT;

CREATE TABLE IF NOT EXISTS harta_kekayaan (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pejabat_id INTEGER NOT NULL REFERENCES pejabat(id) ON DELETE CASCADE,
	tahun INTEGER NOT NULL,
	total_harta INTEGER,
	lhkpn_url TEXT,
	catatan TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pernyataan_status ON pernyataan(status);
CREATE INDEX IF NOT EXISTS idx_pernyataan_pejabat ON pernyataan(pejabat_id);
CREATE INDEX IF NOT EXISTS idx_kasus_pejabat ON kasus_korupsi(pejabat_id);
CREATE INDEX IF NOT EXISTS idx_harta_pejabat ON harta_kekayaan(pejabat_id);
