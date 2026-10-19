-- Model ala Wikipedia: submit langsung tayang, moderasi post-publish (revert).
-- Satu pernyataan bisa punya beberapa sumber.

ALTER TABLE pernyataan ADD COLUMN revision INT NOT NULL DEFAULT 1;
ALTER TABLE pernyataan ADD COLUMN reverted_at TEXT;
ALTER TABLE pernyataan ADD COLUMN revert_reason TEXT;

CREATE TABLE IF NOT EXISTS sumber (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pernyataan_id INTEGER NOT NULL REFERENCES pernyataan(id) ON DELETE CASCADE,
	url TEXT NOT NULL,
	arsip_url TEXT,
	penerbit TEXT,
	judul TEXT
);
CREATE INDEX IF NOT EXISTS idx_sumber_pernyataan ON sumber(pernyataan_id);

-- Pindahkan sumber lama ke tabel sumber, lalu tetap simpan di pernyataan
-- sebagai sumber utama untuk kompatibilitas baca.
INSERT INTO sumber (pernyataan_id, url, arsip_url)
SELECT id, sumber_url, arsip_url FROM pernyataan WHERE sumber_url IS NOT NULL;
