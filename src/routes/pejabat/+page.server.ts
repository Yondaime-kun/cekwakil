import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const q = (url.searchParams.get('q') ?? '').trim();
	const partai = (url.searchParams.get('partai') ?? '').trim();

	const params: unknown[] = [];
	let where = '1=1';
	if (q) {
		params.push(`%${q}%`, `%${q}%`);
		where += ` AND (nama LIKE ? OR dapil LIKE ?)`;
	}
	if (partai) {
		params.push(partai);
		where += ` AND partai = ?`;
	}

	const [rows, partais] = await Promise.all([
		db
			.prepare(
				`SELECT pe.*, (SELECT COUNT(*) FROM pernyataan p WHERE p.pejabat_id=pe.id AND p.status='published') AS jumlah
				 FROM pejabat pe WHERE ${where} ORDER BY pe.nama LIMIT 500`
			)
			.bind(...params)
			.all(),
		db.prepare(`SELECT DISTINCT partai FROM pejabat WHERE partai IS NOT NULL ORDER BY partai`).all()
	]);

	return {
		rows: rows.results ?? [],
		partais: (partais.results ?? []).map((r) => r.partai),
		total: (rows.results ?? []).length,
		q,
		partai
	};
};
