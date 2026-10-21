import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '#lib/db';
import { gayaKartu } from '#lib/ogfont';

// Kartu gambar profil pejabat (OG/Twitter). Lihat /og/[id] untuk catatan
// kenapa SVG, bukan PNG.

const W = 1200;
const H = 630;

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async ({ params }) => {
	const db = getDB();
	const row = await db
		.prepare(
			`SELECT pe.nama, pe.jabatan, pe.partai, pe.dapil, pe.komisi, pe.foto_url,
			        (SELECT COUNT(*) FROM pernyataan p WHERE p.pejabat_id = pe.id AND p.status='published') AS jumlah,
			        (SELECT COUNT(*) FROM kasus_korupsi k WHERE k.pejabat_id = pe.id) AS kasus
			 FROM pejabat pe WHERE pe.slug = ?`
		)
		.bind(params.slug)
		.first<{
			nama: string;
			jabatan: string;
			partai: string | null;
			dapil: string | null;
			komisi: string | null;
			foto_url: string | null;
			jumlah: number;
			kasus: number;
		}>();

	if (!row) throw error(404, 'Tidak ditemukan');

	const inisial = row.nama
		.replace(/[^A-Za-z\s]/g, '')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join('');

	const namaPanjang = row.nama.length > 26;
	const fontNama = namaPanjang ? 46 : 62;
	const meta = [row.jabatan, row.partai, row.dapil, row.komisi].filter(Boolean).join('  ·  ');

	// Foto Wikimedia di-embed lewat <image>; kalau renderer tidak bisa
	// mengambil eksternal, inisial di belakangnya tetap terlihat.
	const foto = row.foto_url
		? `\n    <image href="${esc(row.foto_url)}" x="944" y="196" width="176" height="176" clip-path="url(#lingkar)" preserveAspectRatio="xMidYMid slice"/>`
		: '';

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Profil ${esc(row.nama)}">
  <defs>
    <style type="text/css">${gayaKartu()}</style>
    <clipPath id="lingkar"><circle cx="1032" cy="284" r="88"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="#fbfbfa"/>
  <rect x="0" y="0" width="10" height="${H}" fill="#1f5f4e"/>

  <text x="72" y="92" class="mono" font-size="22" fill="#5c5c58" letter-spacing="2">CEK WAKIL</text>
  <text x="${W - 72}" y="92" text-anchor="end" class="mono" font-size="20" fill="#7d7d79">PROFIL PEJABAT</text>
  <line x1="72" y1="118" x2="${W - 72}" y2="118" stroke="#e0e0de" stroke-width="2"/>

  <circle cx="1032" cy="284" r="88" fill="#eaf2ef" stroke="#b9d3ca" stroke-width="2"/>
  <text x="1032" y="284" text-anchor="middle" dominant-baseline="central" class="head" font-size="58" fill="#1f5f4e">${esc(inisial)}</text>${foto}

  <text x="72" y="236" class="head" font-size="${fontNama}" fill="#1c1c1a">${esc(row.nama.slice(0, 34))}</text>
  <text x="72" y="300" class="mono" font-size="21" fill="#5c5c58">${esc(meta.slice(0, 68))}</text>

  <line x1="72" y1="404" x2="${W - 72}" y2="404" stroke="#e0e0de" stroke-width="2"/>
  <text x="72" y="466" class="head" font-size="60" fill="#1f5f4e">${row.jumlah}</text>
  <text x="72" y="500" class="mono" font-size="18" fill="#5c5c58">KUTIPAN TERARSIP</text>

  <text x="392" y="466" class="head" font-size="60" fill="#1c1c1a">${row.kasus}</text>
  <text x="392" y="500" class="mono" font-size="18" fill="#5c5c58">KASUS TERCATAT</text>

  <line x1="72" y1="${H - 84}" x2="${W - 72}" y2="${H - 84}" stroke="#e0e0de" stroke-width="2"/>
  <text x="72" y="${H - 42}" class="mono" font-size="19" fill="#5c5c58">Arsip pernyataan pejabat publik</text>
  <text x="${W - 72}" y="${H - 42}" text-anchor="end" class="mono" font-size="19" fill="#1f5f4e">cekwakil.bond</text>
</svg>`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
