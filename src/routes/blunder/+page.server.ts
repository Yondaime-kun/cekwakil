import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const q = (url.searchParams.get('q') ?? '').trim();
	const kategori = (url.searchParams.get('kategori') ?? '').trim();
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const perPage = 25;

	const params: unknown[] = [];
	let where = "p.status='published'";
	if (q) {
		params.push(`%${q}%`);
		where += ` AND (p.isi LIKE ? OR pe.nama LIKE ?)`;
		params.push(`%${q}%`);
	}
	if (kategori) {
		params.push(kategori);
		where += ` AND p.kategori = ?`;
	}

	const total = await db
		.prepare(`SELECT COUNT(*) AS c FROM pernyataan p JOIN pejabat pe ON pe.id=p.pejabat_id WHERE ${where}`)
		.bind(...params)
		.first<{ c: number }>();

	const rows = await db
		.prepare(
			`SELECT p.id, p.isi, p.konteks, p.kategori, p.sumber_url, p.arsip_url, p.tanggal,
					pe.nama, pe.slug, pe.partai, pe.jabatan
			 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
			 WHERE ${where}
			 ORDER BY p.tanggal DESC LIMIT ? OFFSET ?`
		)
		.bind(...params, perPage, (page - 1) * perPage)
		.all();

	const kategoris = await db
		.prepare(`SELECT DISTINCT kategori FROM pernyataan WHERE status='published' ORDER BY kategori`)
		.all();

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

	return {
		rows: rows.results ?? [],
		sumberMap,
		kategoris: (kategoris.results ?? []).map((r) => r.kategori),
		total: total?.c ?? 0,
		page,
		perPage,
		q,
		kategori
	};
};
