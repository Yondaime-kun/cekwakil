import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

// Bandingkan dua pejabat: identitas, angka, kutipan, kasus, dan harta.
// Query sengaja terpisah per orang (bukan satu query gabungan) supaya tetap
// sederhana dan hasilnya bisa dipakai ulang dari satu fungsi.

type Profil = {
	id: number;
	nama: string;
	slug: string;
	jabatan: string;
	partai: string | null;
	dapil: string | null;
	komisi: string | null;
	suara: number | null;
	foto_url: string | null;
	bio: string | null;
	jumlah_kutipan: number;
	jumlah_kasus: number;
	nominal_kasus: number;
	harta_terakhir: number | null;
	tahun_harta: number | null;
};

async function ambil(db: D1Database, slug: string): Promise<Profil | null> {
	if (!slug) return null;
	return await db
		.prepare(
			`SELECT pe.id, pe.nama, pe.slug, pe.jabatan, pe.partai, pe.dapil, pe.komisi, pe.suara, pe.foto_url, pe.bio,
			        (SELECT COUNT(*) FROM pernyataan p WHERE p.pejabat_id=pe.id AND p.status='published') AS jumlah_kutipan,
			        (SELECT COUNT(*) FROM kasus_korupsi k WHERE k.pejabat_id=pe.id) AS jumlah_kasus,
			        (SELECT COALESCE(SUM(nominal_rp),0) FROM kasus_korupsi k WHERE k.pejabat_id=pe.id) AS nominal_kasus,
			        (SELECT total_harta FROM harta_kekayaan h WHERE h.pejabat_id=pe.id AND h.status='published' ORDER BY tahun DESC LIMIT 1) AS harta_terakhir,
			        (SELECT tahun FROM harta_kekayaan h WHERE h.pejabat_id=pe.id AND h.status='published' ORDER BY tahun DESC LIMIT 1) AS tahun_harta
			 FROM pejabat pe WHERE pe.slug = ?`
		)
		.bind(slug)
		.first<Profil>();
}

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const aSlug = (url.searchParams.get('a') ?? '').trim();
	const bSlug = (url.searchParams.get('b') ?? '').trim();

	const [a, b] = await Promise.all([ambil(db, aSlug), ambil(db, bSlug)]);

	// Kutipan terbaru masing-masing: maksimal 3, cukup untuk membandingkan nada.
	async function kutipan(id: number | undefined) {
		if (!id) return [];
		const r = await db
			.prepare(
				`SELECT id, isi, kategori, tanggal FROM pernyataan
				 WHERE pejabat_id = ? AND status='published'
				 ORDER BY tanggal DESC, id DESC LIMIT 3`
			)
			.bind(id)
			.all<{ id: number; isi: string; kategori: string; tanggal: string }>();
		return r.results ?? [];
	}

	const [kA, kB] = await Promise.all([kutipan(a?.id), kutipan(b?.id)]);

	// Pilihan dropdown: seluruh pejabat, urut nama.
	const semua = await db
		.prepare(`SELECT slug, nama, partai FROM pejabat ORDER BY nama ASC`)
		.all<{ slug: string; nama: string; partai: string | null }>();

	return {
		a,
		b,
		kA,
		kB,
		semua: semua.results ?? []
	};
};
