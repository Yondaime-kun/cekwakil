import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '#lib/db';

// Ekspor terbuka: siapa pun boleh mengambil dan mem-mirror seluruh dataset.
const CACHE = 'public, max-age=600, s-maxage=3600';

export const GET: RequestHandler = async ({ url }) => {
	const db = getDB();
	const format = (url.searchParams.get('format') ?? 'json').toLowerCase();
	const limit = Math.min(Number(url.searchParams.get('limit') ?? 5000) || 5000, 20000);
	const pejabatSlug = url.searchParams.get('pejabat');

	const where = pejabatSlug ? 'AND pe.slug = ?' : '';
	const binds = pejabatSlug ? [pejabatSlug] : [];

	const rows = await db
		.prepare(
			`SELECT p.id, p.isi, p.konteks, p.kategori, p.sumber_url, p.arsip_url, p.tanggal,
			        pe.id AS pejabat_id, pe.nama AS pejabat_nama, pe.slug AS pejabat_slug,
			        pe.jabatan, pe.partai, pe.dapil, pe.komisi
			 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
			 WHERE p.status = 'published' ${where}
			 ORDER BY p.tanggal DESC LIMIT ${limit}`
		)
		.bind(...binds)
		.all();

	const data = rows.results ?? [];

	// Sertakan semua sumber per entri supaya export bisa di-import balik utuh.
	const ids = data.map((r) => r.id as number);
	const sumberMap: Record<number, Array<{ url: string; arsip_url: string | null }>> = {};
	if (ids.length > 0) {
		const chunk = 100;
		for (let i = 0; i < ids.length; i += chunk) {
			const slice = ids.slice(i, i + chunk);
			const ph = slice.map(() => '?').join(',');
			const sem = await db
				.prepare(`SELECT pernyataan_id, url, arsip_url FROM sumber WHERE pernyataan_id IN (${ph})`)
				.bind(...slice)
				.all<{ pernyataan_id: number; url: string; arsip_url: string | null }>();
			for (const s of sem.results ?? []) {
				(sumberMap[s.pernyataan_id] ??= []).push({ url: s.url, arsip_url: s.arsip_url });
			}
		}
	}
	for (const r of data) {
		r.sumber = sumberMap[r.id as number] ?? [];
	}

	for (const r of data as Array<Record<string, unknown>>) {
		r.sumber = (r.sumber as Array<{ url: string }>).map((s) => s.url).join(' | ');
	}

	if (format === 'csv') {
		const cols = [
			'id',
			'isi',
			'konteks',
			'kategori',
			'sumber_url',
			'arsip_url',
			'sumber',
			'tanggal',
			'pejabat_nama',
			'pejabat_slug',
			'jabatan',
			'partai',
			'dapil',
			'komisi'
		];
		const escape = (v: unknown) => {
			const s = v === null || v === undefined ? '' : String(v);
			return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
		};
		const lines = [cols.join(',')];
		for (const r of data as Array<Record<string, unknown>>) {
			lines.push(cols.map((c) => escape(r[c])).join(','));
		}
		return new Response(lines.join('\n'), {
			headers: {
				'content-type': 'text/csv; charset=utf-8',
				'content-disposition': 'attachment; filename="cekwakil-pernyataan.csv"',
				'cache-control': CACHE
			}
		});
	}

	return json(
		{
			source: 'CekWakil',
			license: 'CC BY-SA 4.0',
			generated_at: new Date().toISOString(),
			count: data.length,
			data
		},
		{ headers: { 'cache-control': CACHE } }
	);
};
