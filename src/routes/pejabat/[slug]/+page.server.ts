import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDB();
	const person = await db
		.prepare(`SELECT * FROM pejabat WHERE slug = ?`)
		.bind(params.slug)
		.first();

	if (!person) throw error(404, 'Pejabat tidak ditemukan');

	const pernyataan = await db
		.prepare(
			`SELECT * FROM pernyataan WHERE pejabat_id = ? AND status='published' ORDER BY tanggal DESC`
		)
		.bind(person.id)
		.all();

	const kasus = await db
		.prepare(`SELECT * FROM kasus_korupsi WHERE pejabat_id = ? ORDER BY tahun DESC`)
		.bind(person.id)
		.all();

	const harta = await db
		.prepare(
			`SELECT tahun, total_harta, lhkpn_url FROM harta_kekayaan
			 WHERE pejabat_id = ? AND status='published'
			 ORDER BY tahun DESC`
		)
		.bind(person.id)
		.all();

	const rekam = await db
		.prepare(
			`SELECT id, judul, uraian, tahun, sumber_url FROM rekam_jejak
			 WHERE pejabat_id = ? AND status='published'
			 ORDER BY tahun DESC, id DESC`
		)
		.bind(person.id)
		.all();

	const jumlahHarta = await db
		.prepare(`SELECT COUNT(*) c FROM harta_kekayaan WHERE pejabat_id = ? AND status='published'`)
		.bind(person.id)
		.first<{ c: number }>();

	return {
		person,
		pernyataan: pernyataan.results ?? [],
		kasus: kasus.results ?? [],
		harta: harta.results ?? [],
		jumlahHarta: jumlahHarta?.c ?? 0,
		rekam: rekam.results ?? []
	};
};
