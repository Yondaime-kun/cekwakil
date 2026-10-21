// Font yang dipakai kartu gambar (canvas) DAN halaman situs.
//
// Subset yang dipakai adalah gabungan latin + latin-ext buatan sendiri
// (src/lib/assets/fonts). Subset "-latin-ext" dari @fontsource TIDAK dipakai:
// isinya hanya huruf beraksen — A, a, b tidak ada — sehingga teks jatuh ke
// font sistem tanpa error apa pun.
//
// Dimuat sebagai @font-face lewat Vite, jadi hanya diunduh saat halaman
// benar-benar butuh (kartu dibagikan), bukan di setiap kunjungan.

import archivo from './assets/fonts/archivo-black.woff2?url';
import mono from './assets/fonts/space-mono.woff2?url';

/** URL font untuk dipakai di CSS atau canvas. */
export const FONT_KARTU = { archivo, mono };

/** Blok CSS siap disuntik; idempoten (aman dipanggil berkali-kali). */
export function pasangFontKartu(): void {
	if (document.getElementById('font-kartu')) return;
	const el = document.createElement('style');
	el.id = 'font-kartu';
	el.textContent = `
		@font-face {
			font-family: 'Archivo Black';
			src: url('${archivo}') format('woff2');
			font-weight: 400;
			font-display: block;
		}
		@font-face {
			font-family: 'Space Mono';
			src: url('${mono}') format('woff2');
			font-weight: 400;
			font-display: block;
		}
	`;
	document.head.appendChild(el);
}
