import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const slug = (url.searchParams.get('pejabat') ?? '').trim();

	const list = await db
		.prepare(
			`SELECT h.id, h.tahun, h.total_harta, h.jenis, h.lhkpn_url, h.created_at, h.status,
			        pe.nama, pe.slug
			 FROM harta_kekayaan h JOIN pejabat pe ON pe.id = h.pejabat_id
			 WHERE h.status='published'
			 ORDER BY h.tahun DESC, h.id DESC LIMIT 60`
		)
		.all();

	const pejabatRows = await db.prepare(`SELECT id, nama, slug FROM pejabat ORDER BY nama`).all();
	const daftar = pejabatRows.results ?? [];

	return {
		list: list.results ?? [],
		pejabat: daftar,
		slug,
		terpilih: slug ? (daftar.find((p) => (p as { slug: string }).slug === slug) ?? null) : null
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const pejabatId = Number(fd.get('pejabat_id'));
		const total = String(fd.get('total_harta') ?? '').replace(/\D/g, '');
		const tahun = Number(fd.get('tahun'));
		const lhkpnUrl = String(fd.get('lhkpn_url') ?? '').trim();

		if (!pejabatId) return fail(400, { message: 'Pilih pejabat dulu.' });
		if (!total) return fail(400, { message: 'Jumlah harta wajib diisi.' });
		if (!tahun || tahun < 2000 || tahun > 2100) return fail(400, { message: 'Tahun tidak valid.' });
		if (!/^https?:\/\//i.test(lhkpnUrl))
			return fail(400, { message: 'Tautan LHKPN wajib berupa URL http(s).' });

		const db = getDB();
		await db
			.prepare(
				`INSERT INTO harta_kekayaan
				 (pejabat_id, tahun, total_harta, jenis, lhkpn_url, status, created_at)
				 VALUES (?, ?, ?, ?, ?, 'published', datetime('now'))`
			)
			.bind(pejabatId, tahun, Number(total), 'LHKPN', lhkpnUrl)
			.run();

		return { ok: true };
	}
};
