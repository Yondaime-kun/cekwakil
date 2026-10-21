import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const rows = await db.prepare(`SELECT id, nama, slug FROM pejabat ORDER BY nama`).all();
	const pejabat = rows.results ?? [];
	const slug = (url.searchParams.get('pejabat') ?? '').trim();
	const terpilih = slug ? (pejabat.find((p) => (p as { slug: string }).slug === slug) ?? null) : null;
	return { pejabat, terpilih };
};

// Tambah rekam jejak (skandal/rapor kerja) dari publik, ala wiki.
export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const pejabatId = Number(fd.get('pejabat_id'));
		const judul = String(fd.get('judul') ?? '').trim();
		const uraian = String(fd.get('uraian') ?? '').trim();
		const tahun = Number(fd.get('tahun'));
		const sumberUrl = String(fd.get('sumber_url') ?? '').trim();

		if (!pejabatId) return fail(400, { message: 'Pejabat tidak valid.' });
		if (judul.length < 5) return fail(400, { message: 'Judul minimal 5 karakter.' });
		if (!tahun || tahun < 1990 || tahun > 2100) return fail(400, { message: 'Tahun tidak valid.' });
		if (!/^https?:\/\//i.test(sumberUrl))
			return fail(400, { message: 'Wajib tautan sumber berita (http/https).' });

		const db = getDB();
		const ada = await db.prepare(`SELECT id FROM pejabat WHERE id=?`).bind(pejabatId).first();
		if (!ada) return fail(404, { message: 'Pejabat tidak ditemukan.' });

		await db
			.prepare(
				`INSERT INTO rekam_jejak (pejabat_id, judul, uraian, tahun, sumber_url)
				 VALUES (?, ?, ?, ?, ?)`
			)
			.bind(pejabatId, judul, uraian || null, tahun, sumberUrl)
			.run();

		const slug = await db
			.prepare(`SELECT slug FROM pejabat WHERE id=?`)
			.bind(pejabatId)
			.first<{ slug: string }>();

		return { ok: true, slug: slug?.slug ?? '' };
	}
};
