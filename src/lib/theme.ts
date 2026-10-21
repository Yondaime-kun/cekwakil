// Tema: terang / gelap / ikut sistem. Pilihan disimpan di localStorage.
// Nilai disimpan SEBELUM halaman digambar (skrip inline di app.html) supaya
// tidak ada kedipan putih saat mode gelap dipilih.

export type Tema = 'light' | 'dark' | 'system';

const KUNCI = 'cekwakil-tema';

export function bacaTema(): Tema {
	if (typeof localStorage === 'undefined') return 'system';
	const t = localStorage.getItem(KUNCI);
	return t === 'light' || t === 'dark' ? t : 'system';
}

export function terapkanTema(t: Tema): void {
	if (typeof document === 'undefined') return;
	const html = document.documentElement;
	if (t === 'system') html.removeAttribute('data-theme');
	else html.setAttribute('data-theme', t);

	try {
		if (t === 'system') localStorage.removeItem(KUNCI);
		else localStorage.setItem(KUNCI, t);
	} catch {
		// Mode privat / storage diblokir: tetap terapkan untuk sesi ini.
	}
}

/** Label & ikon untuk siklus berikutnya. */
export function labelBerikut(t: Tema): string {
	if (t === 'light') return 'Gelapkan tampilan';
	if (t === 'dark') return 'Ikuti tema sistem';
	return 'Terangkan tampilan';
}

export function temaBerikut(t: Tema): Tema {
	return t === 'system' ? 'dark' : t === 'dark' ? 'light' : 'system';
}
