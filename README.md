<p align="center">
  <img src="static/logo.svg" width="88" height="88" alt="Logo CekWakil" />
</p>

# CekWakil

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Yondaime-kun/cekwakil)

Arsip publik pernyataan pejabat Indonesia - anggota DPR RI, kabinet, dan pejabat negara - dengan kutipan kata demi kata dan tautan sumber berita. Model kontribusinya ala wiki: entri langsung tayang, siapa pun bisa melaporkan yang keliru, dan entri yang tidak sesuai sumber ditarik dengan alasan yang dicatat.

**Live:** https://cekwakil.bond
**Repo:** https://github.com/Yondaime-kun/cekwakil — open source, kontribusi terbuka.

## Fitur

- **616 profil pejabat** - 580 anggota DPR RI 2024-2029 + Kabinet Merah Putih (partai, dapil, komisi, perolehan suara)
- **Arsip pernyataan** - kutipan verbatim + multi-sumber berita, tiap sumber diarsipkan otomatis ke Wayback Machine
- **Pencarian cepat ⌘K** - palette global (juga `/`), cari pejabat dan isi kutipan sekaligus, navigasi keyboard
- **Filter berbasis URL** - kategori, partai, lembaga, urutan, halaman; semua bisa di-share dan tahan refresh
- **Lapor langsung tayang** - form lapor dengan pencarian pejabat toleran gelar, multi-sumber, dan dedupe nama otomatis
- **Pre-fill dari profil** - tombol "kutipan untuk dia" langsung mengisi pejabat di form
- **Post-publish review** - tombol "Laporkan" di tiap entri; admin bisa menarik (revert) dengan alasan, dan memulihkannya bila keliru
- **Harta kekayaan (LHKPN)** - riwayat per tahun + grafik naik/turun, diisi publik, wajib tautan dokumen asli
- **Rekam jejak** - skandal/rapor kerja non-korupsi per pejabat
- **Kasus korupsi** - nominal, peran, status hukum, sumber
- **Profil editable** - bio, partai, jabatan, komisi, dapil bisa dilengkapi siapa pun (bio wajib sumber)
- **Panduan sistem DPR** - ensiklopedia singkat dengan scroll-spy: fungsi, dapil, komisi, fraksi, hak angket, PAW, LHKPN
- **Data terbuka** - export JSON/CSV (`/api/export`), lisensi CC BY-SA 4.0; import balik untuk mirror
- **Admin panel** - moderasi post-publish (tarik/pulihkan), kelola laporan, import data, statistik
- **UI** - dark mode otomatis (`prefers-color-scheme`), aksesibel (skip link, focus ring, aria), mobile-first, printable

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
src/lib/components/  # Nav, EntryCard, SearchDialog, Pagination, PejabatPicker,
                     # ShareButton, ConfirmButton, Toaster, Footer, Skeleton
src/lib/             # db (binding D1), utils, normalisasi nama, archive, toast
migrations/          # skema D1 (0001-0014)
scripts/             # backfill arsip Wayback (cron lokal, 6 jam)
```

Catatan migrasi: `0014_harta_created_at.sql` memperbaiki kolom `harta_kekayaan.created_at` yang tidak pernah dibuat — tanpa migrasi ini `/harta` gagal 500 (`no such column`).

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

## Logo

Logo project ada di `static/logo.svg` (penuh 120×120) dan `static/favicon.svg` (32×32, dipakai di tab browser dan sebagai brand mark di navigasi + footer). Warna mengikuti token aksen situs `#1f5f4e`. Kalau logo diubah, ubah kedua file agar konsisten.

## Kontribusi

1. Fork repo, buat branch fitur.
2. `npm install` lalu `npm run dev`.
3. Pastikan `npm run check` bersih (0 error, 0 warning) sebelum membuka PR.
4. PR yang mengubah UI harap menyertakan screenshot desktop + mobile.

Bug dan usulan fitur lewat [GitHub Issues](https://github.com/Yondaime-kun/cekwakil/issues).

## Lisensi

Kode: MIT. Data arsip: CC BY-SA 4.0.
