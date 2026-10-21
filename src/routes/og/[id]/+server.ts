import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '#lib/db';
import { gayaKartu } from '#lib/ogfont';

// Kartu gambar untuk dibagikan (OG/Twitter). SVG, bukan PNG, karena Worker
// tidak punya canvas: semua rasterisasi HTML Canvas butuh native binding.
// WhatsApp/Facebook menolak SVG, jadi yang memakainya: X, Telegram, Discord,
// Slack, iMessage — dan di tempat lain tetap ada og:title + og:description.

const W = 1200;
const H = 630;

// Lebar karakter rough untuk Space Mono (monospace) — cukup akurat untuk
// memutus baris tanpa mengukur font.
const CHAR_W = 0.6;

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** Potong jadi baris dengan lebar maksimum (dalam karakter). */
function bungkus(teks: string, maxChar: number, maxBaris: number): string[] {
	const kata = teks.split(/\s+/).filter(Boolean);
	const baris: string[] = [];
	let kini = '';
	for (const k of kata) {
		const coba = kini ? `${kini} ${k}` : k;
		if (coba.length > maxChar && kini) {
			baris.push(kini);
			kini = k;
			if (baris.length === maxBaris) break;
		} else {
			kini = coba;
		}
	}
	if (baris.length < maxBaris && kini) baris.push(kini);
	if (baris.length === maxBaris) {
		// Tandai terpotong kalau masih ada sisa kata.
		const terpakai = baris.join(' ').length;
		if (terpakai < teks.length - 1) {
			const last = baris[maxBaris - 1];
			baris[maxBaris - 1] = `${last.slice(0, Math.max(0, maxChar - 1)).trimEnd()}…`;
		}
	}
	return baris;
}

export const GET: RequestHandler = async ({ params }) => {
	const db = getDB();
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Tidak ditemukan');

	const row = await db
		.prepare(
			`SELECT p.isi, p.kategori, p.tanggal, pe.nama, pe.jabatan
			 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
			 WHERE p.id = ? AND p.status = 'published'`
		)
		.bind(id)
		.first<{ isi: string; kategori: string; tanggal: string; nama: string; jabatan: string }>();

	if (!row) throw error(404, 'Tidak ditemukan');

	// Area kutipan: dari y=236 sampai garis kaki di y=(H-132), dikurangi
	// ruang napas 26px. Baris maksimum = tinggi tersedia / tinggi baris.
	const AREA_ATAS = 236;
	const AREA_BAWAH = H - 132 - 26;
	const AREA_TINGGI = AREA_BAWAH - AREA_ATAS; // 236

	// Ukuran font menyesuaikan panjang kutipan. Ambangnya diturunkan sampai
	// baris yang dibutuhkan benar-benar muat; tanpa ini kutipan panjang
	// meluap menimpa nama pejabat di kaki kartu.
	const panjang = row.isi.length;
	// Sampai 24px: kutipan Panjang (430+ karakter) masih terbaca di pratinjau
	// WhatsApp/Twitter, dan yang lebih penting tidak menimpa kaki kartu.
	const kandidatFont = [58, 52, 46, 40, 36, 32, 28, 25, 22, 20];
	let fontKutipan = kandidatFont[kandidatFont.length - 1];
	let maxChar = 40;
	let baris: string[] = [];
	for (const f of kandidatFont) {
		const mc = Math.floor((W - 160) / (f * CHAR_W));
		const maksBaris = Math.max(2, Math.floor(AREA_TINGGI / (f * 1.42)));
		const b = bungkus(row.isi, mc, maksBaris);
		fontKutipan = f;
		maxChar = mc;
		baris = b;
		// Muat kalau semua teks terpakai (tidak terpotong) atau sudah di font
		// terkecil yang masih terbaca.
		if (b.join(' ').replace(/…$/, '').length >= panjang - 2) break;
	}
	const lineH = Math.round(fontKutipan * 1.42);

	const tanggal = new Date(row.tanggal).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

	const awalKutipan = AREA_ATAS;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kutipan ${esc(row.nama)}">
  <defs>
    <style type="text/css">${gayaKartu()}</style>
  </defs>

  <rect width="${W}" height="${H}" fill="#fbfbfa"/>

  <!-- garis kiri: aksen hijau, bukan ornamen -->
  <rect x="0" y="0" width="10" height="${H}" fill="#1f5f4e"/>

  <!-- kepala -->
  <text x="72" y="92" class="mono" font-size="22" fill="#5c5c58" letter-spacing="2">CEK WAKIL</text>
  <text x="${W - 72}" y="92" text-anchor="end" class="mono" font-size="20" fill="#7d7d79">${esc(tanggal.toUpperCase())}</text>
  <line x1="72" y1="118" x2="${W - 72}" y2="118" stroke="#e0e0de" stroke-width="2"/>

  <!-- kategori -->
  <text x="72" y="168" class="mono" font-size="20" fill="#1f5f4e" letter-spacing="1.5">${esc(row.kategori.toUpperCase().slice(0, 48))}</text>

  <!-- kutipan -->
  <text x="72" y="${awalKutipan}" class="head" font-size="${fontKutipan}" fill="#1c1c1a">
${baris.map((b, i) => `    <tspan x="72" dy="${i === 0 ? 0 : lineH}">${esc(b)}</tspan>`).join('\n')}
  </text>

  <!-- kaki -->
  <line x1="72" y1="${H - 132}" x2="${W - 72}" y2="${H - 132}" stroke="#e0e0de" stroke-width="2"/>
  <text x="72" y="${H - 76}" class="head" font-size="34" fill="#1c1c1a">${esc(row.nama.slice(0, 40))}</text>
  <text x="72" y="${H - 42}" class="mono" font-size="19" fill="#5c5c58">${esc(row.jabatan.slice(0, 60))}</text>
  <text x="${W - 72}" y="${H - 42}" text-anchor="end" class="mono" font-size="19" fill="#1f5f4e">cekwakil.bond</text>
</svg>`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
