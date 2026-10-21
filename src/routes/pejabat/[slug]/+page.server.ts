import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { renderMarkdown } from '#lib/markdown';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDB();
	const person = await db.prepare(`SELECT * FROM pejabat WHERE slug = ?`).bind(params.slug).first<{
		id: number;
		nama: string;
		slug: string;
		bio?: string | null;
	}>();

	if (!person) throw error(404, 'Pejabat tidak ditemukan');

	const [pernyataan, kasus, harta, rekam] = await Promise.all([
		db
			.prepare(
				`SELECT * FROM pernyataan WHERE pejabat_id = ? AND status='published' ORDER BY tanggal DESC, id DESC`
			)
			.bind(person.id)
			.all(),
		db.prepare(`SELECT * FROM kasus_korupsi WHERE pejabat_id = ? ORDER BY tahun DESC`).bind(person.id).all(),
		db
			.prepare(
				`SELECT tahun, total_harta, lhkpn_url FROM harta_kekayaan
				 WHERE pejabat_id = ? AND status='published'
				 ORDER BY tahun DESC`
			)
			.bind(person.id)
			.all(),
		db
			.prepare(
				`SELECT id, judul, uraian, tahun, sumber_url FROM rekam_jejak
				 WHERE pejabat_id = ? AND status='published'
				 ORDER BY tahun DESC, id DESC`
			)
			.bind(person.id)
			.all()
	]);

	const ids = (pernyataan.results ?? []).map((r) => (r as { id: number }).id);
	const sumberMap: Record<number, Array<{ url: string; arsip_url: string | null }>> = {};
	if (ids.length > 0) {
		const ph = ids.map(() => '?').join(',');
		const sem = await db
			.prepare(`SELECT pernyataan_id, url, arsip_url FROM sumber WHERE pernyataan_id IN (${ph})`)
			.bind(...ids)
			.all<{ pernyataan_id: number; url: string; arsip_url: string | null }>();
		for (const s of sem.results ?? []) {
			(sumberMap[s.pernyataan_id] ??= []).push({ url: s.url, arsip_url: s.arsip_url });
		}
	}

	return {
		person,
		bioHtml: person.bio ? renderMarkdown(String(person.bio)) : '',
		pernyataan: pernyataan.results ?? [],
		sumberMap,
		kasus: kasus.results ?? [],
		harta: harta.results ?? [],
		jumlahHarta: (harta.results ?? []).length,
		rekam: rekam.results ?? []
	};
};
