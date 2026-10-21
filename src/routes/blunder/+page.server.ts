import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { tagEntri, tagPopuler } from '#lib/tag';

const SORTS = {
	baru: 'p.tanggal DESC, p.id DESC',
	lama: 'p.tanggal ASC, p.id ASC',
	dikutip: 'p.created_at DESC, p.id DESC'
} as const;

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
	const kategori = (url.searchParams.get('kategori') ?? '').trim();
	const partai = (url.searchParams.get('partai') ?? '').trim();
	const tag = (url.searchParams.get('tag') ?? '').trim();
	const urut = (url.searchParams.get('urut') ?? 'baru') as keyof typeof SORTS;
	const sort = SORTS[urut] ?? SORTS.baru;
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const perPage = 25;

	const params: unknown[] = [];
	let where = "p.status='published'";
	if (q) {
		// Satu LIKE per kolom: bind yang dipakai ulang tidak selalu aman di D1.
		params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
		where += ` AND (p.isi LIKE ? OR p.konteks LIKE ? OR pe.nama LIKE ? OR pe.dapil LIKE ?)`;
	}
	if (kategori) {
		params.push(kategori);
		where += ` AND p.kategori = ?`;
	}
	if (partai) {
		params.push(partai);
		where += ` AND pe.partai = ?`;
	}
	if (tag) {
		params.push(tag);
		where += ` AND EXISTS (SELECT 1 FROM pernyataan_tag pt JOIN tag t ON t.id=pt.tag_id
					WHERE pt.pernyataan_id = p.id AND t.slug = ?)`;
	}

	const [total, rows, kategoris, partais, tags] = await Promise.all([
		db
			.prepare(
				`SELECT COUNT(*) AS c FROM pernyataan p JOIN pejabat pe ON pe.id=p.pejabat_id WHERE ${where}`
			)
			.bind(...params)
			.first<{ c: number }>(),
		db
			.prepare(
				`SELECT p.id, p.isi, p.konteks, p.kategori, p.sumber_url, p.arsip_url, p.tanggal, p.jumlah_revisi,
						pe.nama, pe.slug, pe.partai, pe.jabatan
				 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE ${where}
				 ORDER BY ${sort} LIMIT ? OFFSET ?`
			)
			.bind(...params, perPage, (page - 1) * perPage)
			.all(),
		db
			.prepare(
				`SELECT kategori, COUNT(*) AS c FROM pernyataan
				 WHERE status='published' GROUP BY kategori ORDER BY c DESC`
			)
			.all<{ kategori: string; c: number }>(),
		db
			.prepare(
				`SELECT pe.partai, COUNT(*) AS c FROM pernyataan p JOIN pejabat pe ON pe.id=p.pejabat_id
				 WHERE p.status='published' AND pe.partai IS NOT NULL
				 GROUP BY pe.partai ORDER BY c DESC`
			)
			.all<{ partai: string; c: number }>(),
		tagPopuler(db)
	]);

	// Semua sumber per entri (multi-sumber) dalam satu query.
	const ids = (rows.results ?? []).map((r) => r.id as number);
	const sumberMap: Record<number, Array<{ url: string; arsip_url: string | null }>> = {};
	if (ids.length > 0) {
		const placeholders = ids.map(() => '?').join(',');
		const sem = await db
			.prepare(`SELECT pernyataan_id, url, arsip_url FROM sumber WHERE pernyataan_id IN (${placeholders})`)
			.bind(...ids)
			.all<{ pernyataan_id: number; url: string; arsip_url: string | null }>();
		for (const s of sem.results ?? []) {
			(sumberMap[s.pernyataan_id] ??= []).push({ url: s.url, arsip_url: s.arsip_url });
		}
	}

	const daftar = rows.results ?? [];
	const tags2 = await tagEntri(db, daftar.map((r) => (r as { id: number }).id));

	return {
		rows: daftar,
		sumberMap,
		tags,
		tagEntri: tags2,
		tag,
		kategoris: kategoris.results ?? [],
		partais: partais.results ?? [],
		total: total?.c ?? 0,
		page,
		perPage,
		q,
		kategori,
		partai,
		urut
	};
};
