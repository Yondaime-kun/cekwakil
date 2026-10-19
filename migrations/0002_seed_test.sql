-- Seed data contoh (profil dummy untuk testing, HAPUS sebelum production)
INSERT INTO pejabat (nama, slug, jabatan, instansi, partai, dapil, komisi) VALUES
('Ahmad Contoh', 'ahmad-contoh', 'Anggota DPR RI', 'DPR RI', 'Partai Contoh', 'Jawa Barat I', 'Komisi I'),
('Budi Test', 'budi-test', 'Menteri Contoh', 'Kabinet Merah Putih', 'Partai Contoh', NULL, NULL);

INSERT INTO pernyataan (pejabat_id, isi, konteks, kategori, sumber_url, tanggal, status) VALUES
(1, 'Ini kalimat contoh pernyataan yang dianggap blunder untuk keperluan testing situs.', 'Contoh konteks: diucapkan dalam seminarTesting.', 'fantasi / keluar nalar', 'https://contohberita.id/artikel/1', '2025-06-01', 'published'),
(1, 'Kalimat contoh kedua dari pejabat yang sama.', 'Konteks testing kedua.', 'anti-kritis / anti-demo', 'https://contohberita.id/artikel/2', '2025-07-15', 'published');

INSERT INTO submissions (pejabat_id, isi, konteks, kategori, sumber_url, tanggal, submitter) VALUES
(2, 'Kalimat contoh menunggu moderasi.', 'Konteks pending.', 'hoaks / misinformasi', 'https://contohberita.id/artikel/3', '2025-08-20', 'Tester');
