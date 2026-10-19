-- Harta kekayaan (LHKPN) yang bisa diisi publik, ala wiki.
-- created_at sudah ada dari 0005, jadi tidak ditambahkan lagi.
ALTER TABLE harta_kekayaan ADD COLUMN jenis TEXT;
ALTER TABLE harta_kekayaan ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE harta_kekayaan ADD COLUMN submitter TEXT;
ALTER TABLE harta_kekayaan ADD COLUMN reverted_at TEXT;
ALTER TABLE harta_kekayaan ADD COLUMN revert_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_harta_pejabat ON harta_kekayaan(pejabat_id);
