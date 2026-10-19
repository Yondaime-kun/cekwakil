# CekWakil

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Yondaime-kun/cekwakil)

Arsip publik pernyataan pejabat Indonesia - anggota DPR RI, kabinet, dan pejabat negara - dengan kutipan kata demi kata dan tautan sumber berita. Model kontribusinya ala wiki: entri langsung tayang, siapa pun bisa melaporkan yang keliru, dan entri yang tidak sesuai sumber ditarik dengan alasan yang dicatat.

**Live:** https://cekwakil.cekwakil0.workers.dev

## Fitur

- **616 profil pejabat** - 580 anggota DPR RI 2024-2029 + Kabinet Merah Putih (partai, dapil, komisi, perolehan suara)
- **Arsip pernyataan** - kutipan verbatim + multi-sumber berita, tiap sumber diarsipkan otomatis ke Wayback Machine
- **Lapor langsung tayang** - form lapor dengan pencarian pejabat, multi-sumber, dan dedupe nama otomatis (gelar & tanda baca dinormalisasi)
- **Post-publish review** - tombol "Laporkan" di tiap entri; admin bisa menarik (revert) dengan alasan, dan memulihkannya bila keliru
- **Harta kekayaan (LHKPN)** - riwayat per tahun, diisi publik, wajib tautan dokumen asli
- **Rekam jejak** - skandal/rapor kerja non-korupsi per pejabat
- **Kasus korupsi** - nominal, peran, status hukum, sumber
- **Profil editable** - bio, partai, jabatan, komisi, dapil bisa dilengkapi siapa pun (bio wajib sumber)
- **Panduan sistem DPR** - ensiklopedia singkat: fungsi, dapil, komisi, fraksi, hak angket, PAW, LHKPN
- **Data terbuka** - export JSON/CSV (`/api/export`), lisensi CC BY-SA 4.0; import balik untuk mirror
- **Admin panel** - moderasi post-publish (tarik/pulihkan), kelola laporan, import data, statistik

## One-click deploy

Klik tombol deploy di atas, atau:

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)](https://deploy.workers.cloudflare.com/?url=https://github.com/Yondaime-kun/cekwakil)

Yang perlu disiapkan setelah deploy:

1. Buat D1: `npx wrangler d1 create cekwakil` -> salin `database_id` ke `wrangler.jsonc`
2. Terapkan migrasi: `npx wrangler d1 execute cekwakil --remote --file=migrations/0001_init.sql` (dan file lainnya berurutan)
3. Set token moderasi: `npx wrangler secret put ADMIN_TOKEN`

## Stack

- **SvelteKit 3** + TypeScript (Svelte 5 runes)
- **Cloudflare Workers** + **D1** (SQLite) - gratis tier
- adapter-cloudflare 8, binding via modul `cloudflare:workers`
- Font self-host: Inter Tight variable (fontsource)

## Menjalankan lokal

```bash
npm install
npx wrangler d1 execute cekwakil --local --file=migrations/0001_init.sql
# ulangi untuk file migrasi lain yang dibutuhkan
npm run dev
```

## Deploy manual

```bash
npx wrangler login --browser=false --device   # login device-code
npm run build
npx wrangler deploy
npx wrangler secret put ADMIN_TOKEN           # token moderasi
```

## Struktur

```
src/routes/          # beranda, /pejabat, /blunder (arsip), /submit, /harta,
                     # /rekam, /panduan, /laporkan, /admin, /api/*
src/lib/             # db (binding D1), utils, normalisasi nama, komponen
migrations/          # skema D1 (0001-0013)
scripts/             # backfill arsip Wayback (cron lokal, 6 jam)
```

## Moderasi model wiki

1. Publik mengirim kutipan + sumber -> **langsung tayang**
2. Pembaca menemukan entri keliru -> klik **Laporkan**
3. Peninjau memeriksa terhadap sumber -> entri **ditarik** (alasan dicatat) atau dibiarkan
4. Pencabutan yang keliru bisa **dipulihkan**

Duplikat pejabat dicegah otomatis: nama baru dinormalisasi (gelar depan/belakang seperti H., Dr., S.H., M.Si. dibuang) sebelum dibandingkan dengan profil yang ada.

## Data

- Profil DPR: Wikipedia (DPR RI 2024-2029), anggota kabinet ditambahkan manual
- Seluruh isi arsip: kontribusi publik dengan sumber wajib
- Export: `GET /api/export?format=json|csv` - bebas dimirror dengan atribusi

## Lisensi

Kode: MIT. Data arsip: CC BY-SA 4.0.
