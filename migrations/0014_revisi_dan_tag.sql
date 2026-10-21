-- Model wiki sungguhan: revisi beralur + taksonomi tag + verifikasi komunitas.
--
-- Kenapa: sebelumnya "koreksi" berarti UPDATE langsung pada baris pernyataan.
-- Riwayat hilang, rollback tidak mungkin, dan satu-satunya yang bisa menarik
-- entri adalah pemegang token admin. Tabel revisions membuat setiap perubahan
-- jadi catatan permanen yang bisa dibatalkan siapa pun.

-- ---------------------------------------------------------------------------
-- 1. Revisi: satu baris = satu snapshot keadaan entri setelah perubahan.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS revisions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	pernyataan_id INTEGER NOT NULL REFERENCES pernyataan(id) ON DELETE CASCADE,
	revisi INTEGER NOT NULL,                 -- nomor revisi (1 = versi pertama)
	aksi TEXT NOT NULL,                      -- buat | sunting | tarik | pulihkan
	isi TEXT NOT NULL,
	konteks TEXT NOT NULL DEFAULT '',
	kategori TEXT NOT NULL,
	tanggal TEXT NOT NULL,
	sumber_url TEXT NOT NULL,
	status TEXT NOT NULL,                    -- status entri SETELAH aksi ini
	catatan TEXT,                            -- ringkasan/alasan perubahan
	oleh TEXT,                               -- nama kontributor (boleh kosong)
	oleh_hash TEXT,                          -- penanda perangkat, bukan identitas
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rev_entri ON revisions(pernyataan_id, revisi DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rev_unik ON revisions(pernyataan_id, revisi);

-- ---------------------------------------------------------------------------
-- 2. Verifikasi komunitas: entri baru tayang tapi ditandai belum diperiksa.
--    Siapa pun bisa "Setujui" tanpa akun; jejaknya dicatat.
-- ---------------------------------------------------------------------------
ALTER TABLE pernyataan ADD COLUMN diverifikasi_oleh TEXT;
ALTER TABLE pernyataan ADD COLUMN diverifikasi_at TEXT;
ALTER TABLE pernyataan ADD COLUMN jumlah_revisi INTEGER NOT NULL DEFAULT 1;

-- Entri yang sudah ada dianggap terverifikasi (sudah tayang sejak lama).
UPDATE pernyataan
SET diverifikasi_at = COALESCE(created_at, datetime('now')),
    diverifikasi_oleh = 'arsip awal'
WHERE diverifikasi_at IS NULL;

-- ---------------------------------------------------------------------------
-- 3. Tag: taksonomi ringan, banyak-ke-banyak.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tag (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,               -- 'anggaran'
	label TEXT NOT NULL,                     -- 'Anggaran'
	dibuat_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS pernyataan_tag (
	pernyataan_id INTEGER NOT NULL REFERENCES pernyataan(id) ON DELETE CASCADE,
	tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
	PRIMARY KEY (pernyataan_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_ptag_tag ON pernyataan_tag(tag_id);

-- Backfill revisi #1 untuk data lama supaya riwayatnya punya titik awal.
INSERT INTO revisions
	(pernyataan_id, revisi, aksi, isi, konteks, kategori, tanggal, sumber_url, status, catatan, oleh, created_at)
SELECT
	p.id, 1, 'buat', p.isi, COALESCE(p.konteks, ''), p.kategori, p.tanggal, p.sumber_url,
	p.status, 'Impor dari arsip awal', COALESCE(p.submitter, 'arsip awal'), COALESCE(p.created_at, datetime('now'))
FROM pernyataan p
WHERE NOT EXISTS (SELECT 1 FROM revisions r WHERE r.pernyataan_id = p.id);
