// Skor kelengkapan profil.
//
// Tujuannya bukan menghukum data yang tidak tersedia, tapi memberi urutan
// kerja yang jelas bagi kontributor: kolom mana yang paling gampang diisi
// dan paling berdampak. Bobot sengaja sederhana dan bisa dibaca siapa pun.

export type KolomProfil = {
	partai?: string | null;
	dapil?: string | null;
	komisi?: string | null;
	suara?: number | null;
	foto_url?: string | null;
	wikipedia_url?: string | null;
	bio?: string | null;
	sumber_bio?: string | null;
	jumlah_kutipan?: number | null;
};

export type Butir = {
	kunci: string;
	label: string;
	bobot: number;
	ada: boolean;
	// Kalau diisi, halaman menautkan ke tempat mengisinya.
	tautan?: string;
};

/**
 * Tiga kelompok: identitas (paling penting, paling gampang), jejak publik,
 * dan isi arsip. Total bobot 100 supaya persennya bisa langsung dipakai.
 */
export function hitungButir(p: KolomProfil, slug: string): Butir[] {
	const ada = (v: unknown) =>
		v !== null && v !== undefined && String(v).trim() !== '' && String(v) !== '0';

	return [
		{ kunci: 'partai', label: 'Partai', bobot: 12, ada: ada(p.partai), tautan: `/pejabat/${slug}/edit` },
		{ kunci: 'dapil', label: 'Dapil', bobot: 12, ada: ada(p.dapil), tautan: `/pejabat/${slug}/edit` },
		{ kunci: 'komisi', label: 'Komisi', bobot: 12, ada: ada(p.komisi), tautan: `/pejabat/${slug}/edit` },
		{
			kunci: 'suara',
			label: 'Perolehan suara',
			bobot: 8,
			ada: ada(p.suara),
			tautan: `/pejabat/${slug}/edit`
		},
		{ kunci: 'foto', label: 'Foto', bobot: 14, ada: ada(p.foto_url), tautan: `/pejabat/${slug}/edit` },
		{
			kunci: 'wikipedia',
			label: 'Tautan Wikipedia',
			bobot: 6,
			ada: ada(p.wikipedia_url),
			tautan: `/pejabat/${slug}/edit`
		},
		{ kunci: 'bio', label: 'Bio singkat', bobot: 10, ada: ada(p.bio), tautan: `/pejabat/${slug}/edit` },
		{
			kunci: 'kutipan',
			label: 'Minimal 1 kutipan terarsip',
			bobot: 20,
			ada: (p.jumlah_kutipan ?? 0) > 0,
			tautan: `/submit?pejabat=${slug}`
		},
		{
			kunci: 'bio_sumber',
			label: 'Sumber bio',
			bobot: 6,
			ada: !ada(p.bio) || ada(p.sumber_bio),
			tautan: `/pejabat/${slug}/edit`
		}
	];
}

/** 0–100. Butir "sumber bio" dihitung benar kalau bio memang belum diisi. */
export function skorKelengkapan(butir: Butir[]): number {
	const total = butir.reduce((a, b) => a + b.bobot, 0) || 1;
	const dapat = butir.reduce((a, b) => a + (b.ada ? b.bobot : 0), 0);
	return Math.round((dapat / total) * 100);
}

/** Label singkat supaya statusnya bisa dibaca tanpa melihat angka. */
export function labelSkor(skor: number): { teks: string; nada: 'error' | 'warn' | 'ok' } {
	if (skor >= 85) return { teks: 'Lengkap', nada: 'ok' };
	if (skor >= 55) return { teks: 'Sebagian', nada: 'warn' };
	return { teks: 'Minim', nada: 'error' };
}
