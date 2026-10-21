// Markdown minimal untuk field deskriptif (konteks, bio) — BUKAN untuk kutipan.
//
// Alasan: kutipan wajib verbatim. Kalau kutipan boleh diformat (bold, link,
// blockquote), orang bisa mengubah penekanan makna tanpa mengubah satu kata.
// Markdown di sini sengaja dibatasi: tanpa HTML mentah, tanpa gambar, tanpa
// heading (hierarki halaman tetap milik layout).
//
// Keamanan: semua teks di-escape LEBIH DULU, baru ditandai. Jadi tidak ada
// jalur untuk menyuntikkan tag, atribut, atau javascript: URL.

const ESC: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

function esc(s: string): string {
	return s.replace(/[&<>"']/g, (c) => ESC[c]);
}

/**
 * Hanya izinkan http(s) pada link. Tautan relatif dan skema lain (javascript:,
 * data:) ditolak dan dirender sebagai teks biasa.
 */
function tautanAman(url: string): string | null {
	const t = url.trim();
	if (!/^https?:\/\//i.test(t)) return null;
	try {
		const u = new URL(t);
		if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
		return u.toString();
	} catch {
		return null;
	}
}

/** Render markdown terbatas ke HTML yang sudah aman. */
export function renderMarkdown(src: string): string {
	if (!src) return '';

	// Normalisasi baris; batasi panjang agar tidak jadi beban render.
	const teks = src.replace(/\r\n?/g, '\n').slice(0, 4000);
	const baris = teks.split('\n');

	const hasil: string[] = [];
	let paragraf: string[] = [];
	let daftar: { jenis: 'ul' | 'ol'; item: string[] } | null = null;

	const tutupParagraf = () => {
		if (paragraf.length) {
			hasil.push(`<p>${paragraf.join('<br />')}</p>`);
			paragraf = [];
		}
	};
	const tutupDaftar = () => {
		if (daftar) {
			const tag = daftar.jenis;
			hasil.push(
				`<${tag}>${daftar.item.map((i) => `<li>${i}</li>`).join('')}</${tag}>`
			);
			daftar = null;
		}
	};

	for (const mentah of baris) {
		const t = mentah.trim();

		if (t === '') {
			tutupParagraf();
			tutupDaftar();
			continue;
		}

		// Daftar berurutan: "1. teks" / "- teks"
		const ol = t.match(/^\d+[.)]\s+(.*)$/);
		const ul = t.match(/^[-*]\s+(.*)$/);
		if (ol || ul) {
			tutupParagraf();
			const jenis = ol ? 'ol' : 'ul';
			const isi = inline(ol ? ol[1] : (ul as RegExpMatchArray)[1]);
			if (!daftar || daftar.jenis !== jenis) {
				tutupDaftar();
				daftar = { jenis, item: [isi] };
			} else {
				daftar.item.push(isi);
			}
			continue;
		}

		tutupDaftar();
		paragraf.push(inline(t));
	}

	tutupParagraf();
	tutupDaftar();
	return hasil.join('');
}

/** Format inline: **tebal**, *miring*, `kode`, [teks](url). */
function inline(teks: string): string {
	let s = esc(teks);

	// Kode inline dulu supaya ** di dalam `...` tidak diproses.
	s = s.replace(/`([^`]+)`/g, (_m, isi: string) => `<code>${isi}</code>`);
	s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

	// Link: teks sudah ter-escape, URL divalidasi.
	s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
		const aman = tautanAman(url.replace(/&amp;/g, '&'));
		if (!aman) return label === m ? esc(url) : label;
		return `<a href="${esc(aman)}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`;
	});

	return s;
}

/** Versi polos untuk placeholder/preview singkat (mis. meta description). */
export function markdownKeTeks(src: string): string {
	return src
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`>#-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Judul tag dari slug: 'anggaran-pendidikan' -> 'Anggaran Pendidikan'. */
export function rapikanLabel(slug: string): string {
	return slug
		.split('-')
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}
