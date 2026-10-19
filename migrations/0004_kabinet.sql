-- Kabinet Merah Putih: update jabatan anggota DPR yang jadi menteri/pimpinan, lalu insert sisanya.
-- Anggota DPR sudah ada di 0003 (dengan suara) - cukup promosi jabatan + instansi.

UPDATE pejabat SET jabatan='Menteri Sekretaris Negara', instansi='Kabinet Merah Putih' WHERE slug='prasetyo-hadi';
UPDATE pejabat SET jabatan='Menteri Luar Negeri', instansi='Kabinet Merah Putih' WHERE slug='sugiono';
UPDATE pejabat SET jabatan='Menteri Kebudayaan', instansi='Kabinet Merah Putih' WHERE slug='fadli-zon';
UPDATE pejabat SET jabatan='Menteri Pelindungan Pekerja Migran Indonesia', instansi='Kabinet Merah Putih' WHERE slug='mukhtarudin';
UPDATE pejabat SET jabatan='Menteri Agraria dan Tata Ruang', instansi='Kabinet Merah Putih' WHERE slug='nusron-wahid';
UPDATE pejabat SET jabatan='Ketua DPR RI', instansi='DPR RI' WHERE slug='puan-maharani';
UPDATE pejabat SET jabatan='Wakil Ketua DPR RI', instansi='DPR RI' WHERE slug='sufmi-dasco-ahmad';
UPDATE pejabat SET jabatan='Wakil Ketua DPR RI', instansi='DPR RI' WHERE slug='adies-kadir';
UPDATE pejabat SET jabatan='Wakil Ketua DPR RI', instansi='DPR RI' WHERE slug='saan-mustopa';
UPDATE pejabat SET jabatan='Wakil Ketua DPR RI', instansi='DPR RI' WHERE slug='cucun-ahmad-syamsurijal';
UPDATE pejabat SET jabatan='Wakil Ketua DPR RI', instansi='DPR RI' WHERE slug='sari-yuliati';

-- Insert pejabat yang BUKAN anggota DPR (presiden, menteri non-parlemen).
INSERT INTO pejabat (nama, slug, jabatan, instansi, partai) VALUES
('Prabowo Subianto', 'prabowo-subianto', 'Presiden RI', 'Kabinet Merah Putih', 'Gerindra'),
('Gibran Rakabuming Raka', 'gibran-rakabuming-raka', 'Wakil Presiden RI', 'Kabinet Merah Putih', NULL),
('Djamari Chaniago', 'djamari-chaniago', 'Menteri Koordinator Politik dan Keamanan', 'Kabinet Merah Putih', NULL),
('Yusril Ihza Mahendra', 'yusril-ihza-mahendra', 'Menteri Koordinator Hukum, HAM, Imigrasi, dan Pemasyarakatan', 'Kabinet Merah Putih', NULL),
('Airlangga Hartarto', 'airlangga-hartarto', 'Menteri Koordinator Perekonomian', 'Kabinet Merah Putih', 'Golkar'),
('Pratikno', 'pratikno', 'Menteri Koordinator Pembangunan Manusia dan Kebudayaan', 'Kabinet Merah Putih', NULL),
('Agus Harimurti Yudhoyono', 'agus-harimurti-yudhoyono', 'Menteri Koordinator Infrastruktur dan Pembangunan Kewilayahan', 'Kabinet Merah Putih', 'Demokrat'),
('Abdul Muhaimin Iskandar', 'abdul-muhaimin-iskandar', 'Menteri Koordinator Pemberdayaan Masyarakat', 'Kabinet Merah Putih', 'PKB'),
('Zulkifli Hasan', 'zulkifli-hasan', 'Menteri Koordinator Pangan', 'Kabinet Merah Putih', 'PAN'),
('Muhammad Tito Karnavian', 'muhammad-tito-karnavian', 'Menteri Dalam Negeri', 'Kabinet Merah Putih', NULL),
('Sjafrie Sjamsoeddin', 'sjafrie-sjamsoeddin', 'Menteri Pertahanan', 'Kabinet Merah Putih', 'Gerindra'),
('Nasaruddin Umar', 'nasaruddin-umar', 'Menteri Agama', 'Kabinet Merah Putih', NULL),
('Supratman Andi Agtas', 'supratman-andi-agtas', 'Menteri Hukum', 'Kabinet Merah Putih', 'Golkar'),
('Natalius Pigai', 'natalius-pigai', 'Menteri Hak Asasi Manusia', 'Kabinet Merah Putih', NULL),
('Suahasil Nazara', 'suahasil-nazara', 'Menteri Keuangan', 'Kabinet Merah Putih', NULL),
('Sri Mulyani Indrawati', 'sri-mulyani-indrawati', 'Menteri Keuangan (2024-2026, diganti reshuffle)', 'Kabinet Merah Putih', NULL),
('Abdul Mu''ti', 'abdul-muti', 'Menteri Pendidikan Dasar dan Menengah', 'Kabinet Merah Putih', NULL),
('Brian Yuliarto', 'brian-yuliarto', 'Menteri Pendidikan Tinggi, Sains, dan Teknologi', 'Kabinet Merah Putih', NULL),
('Budi Gunadi Sadikin', 'budi-gunadi-sadikin', 'Menteri Kesehatan', 'Kabinet Merah Putih', NULL),
('Saifullah Yusuf', 'saifullah-yusuf', 'Menteri Sosial', 'Kabinet Merah Putih', 'PKB'),
('Yassierli', 'yassierli', 'Menteri Ketenagakerjaan', 'Kabinet Merah Putih', NULL),
('Agus Gumiwang Kartasasmita', 'agus-gumiwang-kartasasmita', 'Menteri Perindustrian', 'Kabinet Merah Putih', 'Golkar'),
('Budi Santoso', 'budi-santoso', 'Menteri Perdagangan', 'Kabinet Merah Putih', 'Golkar'),
('Bahlil Lahadalia', 'bahlil-lahadalia', 'Menteri Energi dan Sumber Daya Mineral', 'Kabinet Merah Putih', 'Gerindra'),
('Dody Hanggodo', 'dody-hanggodo', 'Menteri Pekerjaan Umum', 'Kabinet Merah Putih', 'Golkar'),
('Maruarar Sirait', 'maruarar-sirait', 'Menteri Perumahan dan Kawasan Permukiman', 'Kabinet Merah Putih', 'PDI-P'),
('Yandri Susanto', 'yandri-susanto', 'Menteri Desa dan Pembangunan Daerah Tertinggal', 'Kabinet Merah Putih', 'PAN'),
('M. Iftitah Sulaiman', 'm-iftitah-sulaiman', 'Menteri Transmigrasi', 'Kabinet Merah Putih', 'PAN'),
('Dody Purwagandhi', 'dody-purwagandhi', 'Menteri Perhubungan', 'Kabinet Merah Putih', 'Golkar'),
('Meutya Viada Hafid', 'meutya-viada-hafid', 'Menteri Komunikasi dan Digital', 'Kabinet Merah Putih', 'Golkar'),
('Andi Amran Sulaiman', 'andi-amran-sulaiman', 'Menteri Pertanian', 'Kabinet Merah Putih', 'PAN'),
('Raja Juli Antoni', 'raja-juli-antoni', 'Menteri Kehutanan', 'Kabinet Merah Putih', 'PKS'),
('Sakti Wahyu Trenggono', 'sakti-wahyu-trenggono', 'Menteri Kelautan dan Perikanan', 'Kabinet Merah Putih', 'Gerindra'),
('Rachmat Pambudy', 'rachmat-pambudy', 'Menteri Perencanaan Pembangunan Nasional', 'Kabinet Merah Putih', 'Golkar'),
('Rini Widyantini', 'rini-widyantini', 'Menteri PAN dan Reformasi Birokrasi', 'Kabinet Merah Putih', NULL),
('Wihaji', 'wihaji', 'Menteri Kependudukan dan Pembangunan Keluarga', 'Kabinet Merah Putih', 'PAN');
