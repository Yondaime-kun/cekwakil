// Font untuk kartu gambar (OG).
//
// @font-face dengan url() relatif TIDAK bisa dipakai di SVG standalone:
// dokumen SVG tidak punya base URL yang sama dengan halaman, jadi browser
// memblokir fetch-nya dan teks jatuh ke font sistem. Solusinya menanam font
// sebagai data URI langsung di dalam SVG — ~35 KB base64 untuk dua subset.
//
// Sumber data: import `?inline` dari paket @fontsource; Vite mengembalikan
// string base64, termasuk di dev, tanpa request jaringan. Asset binding
// sengaja tidak dipakai: di dev ia tidak me-resolve /fonts/* dan kartu
// diam-diam jatuh ke font sistem.
//
// Hasil CSS di-cache di memori Worker karena isinya tidak pernah berubah.

// File di ./assets/fonts adalah gabungan subset latin + latin-ext. Subset
// "-latin-ext" dari @fontsource hanya berisi huruf beraksen (A, a, b tidak
// ada!), sehingga kalau dipakai sendiri semua teks jatuh ke font sistem.
import archivoInline from './assets/fonts/archivo-black.woff2?inline';
import monoInline from './assets/fonts/space-mono.woff2?inline';

let cache: string | null = null;

/** Pastikan nilainya data URI; selain itu dianggap tidak tersedia. */
function dataUri(v: unknown): string | null {
	return typeof v === 'string' && v.startsWith('data:') ? v : null;
}

/** Blok CSS siap tempel di dalam <defs>, sudah berisi font ter-embed. */
export function gayaKartu(): string {
	if (cache) return cache;

	const face = (nama: string, uri: string | null) =>
		uri
			? `@font-face { font-family: '${nama}'; src: url('${uri}') format('woff2'); font-weight: 400; font-display: block; }`
			: `/* ${nama}: font tertanam tidak tersedia, memakai font sistem */`;

	cache = [
		face('Archivo Black', dataUri(archivoInline)),
		face('Space Mono', dataUri(monoInline)),
		".mono { font-family: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }",
		".head { font-family: 'Archivo Black', 'Arial Black', Impact, sans-serif; letter-spacing: -0.02em; }"
	].join('\n      ');

	return cache;
}
