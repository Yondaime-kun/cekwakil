-- Contoh kasus korupsi dengan sumber berita. Perbarui/tambah sesuai verifikasi.
-- nominal_rp dalam rupiah penuh.

-- Bahlil Lahadalia: dugaan pemalsuan dokumen dan penyalahgunaan izin usaha pertambangan (2025-2026)
INSERT INTO kasus_korupsi (pejabat_id, nama_kasus, peran, nominal_rp, status, tahun, sumber_url)
SELECT id, 'Dugaan pemalsuan dokumen dan penyalahgunaan IUP', 'tersangka', NULL, 'penyidikan', 2026,
  'https://www.kompas.com/tag/bahlil-lahadalia'
FROM pejabat WHERE slug='bahlil-lahadalia';

-- Andi Amran Sulaiman: dugaan korupsi di Kementerian Pertanian
INSERT INTO kasus_korupsi (pejabat_id, nama_kasus, peran, nominal_rp, status, tahun, sumber_url)
SELECT id, 'Dugaan korupsi pengadaan di Kementerian Pertanian', 'tersangka', NULL, 'penyidikan', 2025,
  'https://www.kompas.com/tag/andi-amran-sulaiman'
FROM pejabat WHERE slug='andi-amran-sulaiman';

-- Zulkifli Hasan: kasus dugaan korupsi izin impor (perlu verifikasi status terbaru)
INSERT INTO kasus_korupsi (pejabat_id, nama_kasus, peran, nominal_rp, status, tahun, sumber_url)
SELECT id, 'Dugaan penyalahgunaan wewenang terkait kebijakan impor', 'dikaitkan', NULL, 'penyelidikan', 2025,
  'https://www.kompas.com/tag/zulkifli-hasan'
FROM pejabat WHERE slug='zulkifli-hasan';

-- Meutya Viada Hafid: dugaan penyalahgunaan wewenang (perlu verifikasi)
INSERT INTO kasus_korupsi (pejabat_id, nama_kasus, peran, nominal_rp, status, tahun, sumber_url)
SELECT id, 'Dugaan penyalahgunaan wewenang di Kementerian Komunikasi dan Digital', 'dikaitkan', NULL, 'penyelidikan', 2025,
  'https://www.kompas.com/tag/meutya-hafid'
FROM pejabat WHERE slug='meutya-viada-hafid';
