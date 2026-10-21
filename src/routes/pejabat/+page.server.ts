import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

const SORTS = {
	nama: 'pe.nama ASC',
	kutipan: 'jumlah DESC, pe.nama ASC',
	suara: '(pe.suara IS NULL), pe.suara DESC, pe.nama ASC'
} as const;

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
	const partai = (url.searchParams.get('partai') ?? '').trim();
	const instansi = (url.searchParams.get('instansi') ?? '').trim();
	const urut = (url.searchParams.get('urut') ?? 'nama') as keyof typeof SORTS;
	const sort = SORTS[urut] ?? SORTS.nama;
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const perPage = 48;

	const params: unknown[] = [];
	let where = '1=1';
	if (q) {
		params.push(`%${q}%`, `%${q}%`, `%${q}%`);
		where += ` AND (pe.nama LIKE ? OR pe.dapil LIKE ? OR pe.komisi LIKE ?)`;
	}
	if (partai) {
		params.push(partai);
		where += ` AND pe.partai = ?`;
	}
	if (instansi) {
		params.push(instansi);
		where += ` AND pe.instansi = ?`;
	}

	const [total, rows, partais, instansis] = await Promise.all([
		db.prepare(`SELECT COUNT(*) c FROM pejabat pe WHERE ${where}`).bind(...params).first<{ c: number }>(),
		db
			.prepare(
				`SELECT pe.id, pe.nama, pe.slug, pe.jabatan, pe.instansi, pe.partai, pe.dapil, pe.komisi, pe.suara,
						(SELECT COUNT(*) FROM pernyataan p WHERE p.pejabat_id=pe.id AND p.status='published') AS jumlah
				 FROM pejabat pe WHERE ${where}
				 ORDER BY ${sort} LIMIT ? OFFSET ?`
			)
			.bind(...params, perPage, (page - 1) * perPage)
			.all(),
		db
			.prepare(
				`SELECT partai, COUNT(*) c FROM pejabat WHERE partai IS NOT NULL GROUP BY partai ORDER BY c DESC`
			)
			.all<{ partai: string; c: number }>(),
		db
			.prepare(`SELECT instansi, COUNT(*) c FROM pejabat GROUP BY instansi ORDER BY c DESC`)
			.all<{ instansi: string; c: number }>()
	]);

	return {
		rows: rows.results ?? [],
		partais: partais.results ?? [],
		instansis: instansis.results ?? [],
		total: total?.c ?? 0,
		page,
		perPage,
		q,
		partai,
		instansi,
		urut
	};
};
