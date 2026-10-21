import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { hitungButir, skorKelengkapan } from '#lib/kelengkapan';

// Daftar kerja kontributor: profil yang paling bolong lebih dulu.
// Semua hitungan dilakukan di Worker karena skor bergantung pada 9 kolom
// yang harus dinilai bersamaan; 616 baris masih ringan (~1 query).

type Baris = {
	id: number;
	nama: string;
	slug: string;
	jabatan: string;
	jabatan_unik: string;
	partai: string | null;
	dapil: string | null;
	komisi: string | null;
	suara: number | null;
	foto_url: string | null;
	wikipedia_url: string | null;
	bio: string | null;
	sumber_bio: string | null;
	jumlah_kutipan: number;
};

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const fokus = url.searchParams.get('fokus') ?? '';
	const partai = url.searchParams.get('partai') ?? '';
	const halaman = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const perPage = 40;

	const params: unknown[] = [];
	let where = '1=1';
	if (partai) {
		params.push(partai);
		where += ' AND pe.partai = ?';
	}

	const [rows, partais, totalPejabat] = await Promise.all([
		db
			.prepare(
				`SELECT pe.id, pe.nama, pe.slug, pe.jabatan, pe.partai, pe.dapil, pe.komisi, pe.suara,
				        pe.foto_url, pe.wikipedia_url, pe.bio, pe.sumber_bio,
				        (SELECT COUNT(*) FROM pernyataan p WHERE p.pejabat_id = pe.id AND p.status='published') AS jumlah_kutipan
				 FROM pejabat pe WHERE ${where}
				 ORDER BY pe.nama ASC`
			)
			.bind(...params)
			.all<Baris>(),
		db
			.prepare(
				`SELECT partai, COUNT(*) c FROM pejabat WHERE partai IS NOT NULL GROUP BY partai ORDER BY c DESC`
			)
			.all<{ partai: string; c: number }>(),
		db.prepare(`SELECT COUNT(*) c FROM pejabat`).first<{ c: number }>()
	]);

	const dinilai = (rows.results ?? []).map((r) => {
		const butir = hitungButir(
			{
				partai: r.partai,
				dapil: r.dapil,
				komisi: r.komisi,
				suara: r.suara,
				foto_url: r.foto_url,
				wikipedia_url: r.wikipedia_url,
				bio: r.bio,
				sumber_bio: r.sumber_bio,
				jumlah_kutipan: r.jumlah_kutipan
			},
			r.slug
		);
		const skor = skorKelengkapan(butir);
		// Kolom yang belum ada, dipakai sebagai label "butuh: foto, komisi".
		const kosong = butir.filter((b) => !b.ada).map((b) => b.label.toLowerCase());
		return { ...r, skor, kosong };
	});

	// Filter fokus: "foto" | "kutipan" | "komisi" | "bio" | "dapil" | "suara"
	const fokusMap: Record<string, string> = {
		foto: 'foto',
		kutipan: 'minimal 1 kutipan terarsip',
		komisi: 'komisi',
		bio: 'bio singkat',
		dapil: 'dapil',
		suara: 'perolehan suara',
		wikipedia: 'tautan wikipedia',
		partai: 'partai'
	};

	let hasil = dinilai;
	if (fokusMap[fokus]) {
		hasil = dinilai.filter((r) => r.kosong.includes(fokusMap[fokus]));
	}

	hasil.sort((a, b) => a.skor - b.skor || a.nama.localeCompare(b.nama));

	const awal = (halaman - 1) * perPage;

	// Ringkasan untuk header: berapa yang benar-benar kosong di tiap kolom.
	const ringkas = {
		total: totalPejabat?.c ?? 0,
		tanpaFoto: dinilai.filter((r) => r.kosong.includes('foto')).length,
		tanpaKutipan: dinilai.filter((r) => r.kosong.includes('minimal 1 kutipan terarsip')).length,
		tanpaKomisi: dinilai.filter((r) => r.kosong.includes('komisi')).length,
		tanpaBio: dinilai.filter((r) => r.kosong.includes('bio singkat')).length,
		rataRata: dinilai.length
			? Math.round(dinilai.reduce((a, b) => a + b.skor, 0) / dinilai.length)
			: 0
	};

	return {
		rows: hasil.slice(awal, awal + perPage),
		total: hasil.length,
		ringkas,
		partais: partais.results ?? [],
		partai,
		fokus,
		halaman,
		perPage
	};
};
