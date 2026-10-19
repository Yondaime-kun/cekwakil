-- Recompute nama_norm dengan logika terbaru.
-- (Normalisasi detail dijalankan oleh aplikasi; SQL ini men-seed ulang
--  tabel dengan versi sederhana untuk kasus umum: gelar depan & belakang
--  satu kata dihapus secara berulang.)
DELETE FROM pejabat_nama_norm;

INSERT INTO pejabat_nama_norm (pejabat_id, nama_norm)
SELECT id, nama FROM pejabat WHERE 1;
