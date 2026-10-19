import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getDB, getEnv } from '#lib/db';
import { archiveUrl } from '#lib/archive';

// Admin moderation API. Auth via Authorization: Bearer token (wrangler secret).

function checkAdmin(request: Request, env: Record<string, unknown>): void {
	const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	if (!token || token !== env.ADMIN_TOKEN) throw error(401, 'Unauthorized');
}

export const GET: RequestHandler = async ({ request }) => {
	checkAdmin(request, getEnv());
	const db = getDB();
	const rows = await db
		.prepare(
			`SELECT s.*, pe.nama AS pejabat_nama FROM submissions s
			 LEFT JOIN pejabat pe ON pe.id = s.pejabat_id
			 WHERE s.status = 'pending' ORDER BY s.created_at ASC`
		)
		.all();
	return json({ pending: rows.results ?? [] });
};

export const POST: RequestHandler = async ({ request }) => {
	checkAdmin(request, getEnv());
	const db = getDB();
	const body = (await request.json()) as {
		id: number;
		action: 'approve' | 'reject';
		nama_pejabat?: string;
		partai?: string;
		jabatan?: string;
		review_note?: string;
	};

	const sub = await db.prepare(`SELECT * FROM submissions WHERE id = ?`).bind(body.id).first<Record<string, unknown>>();
	if (!sub) throw error(404, 'Submission not found');
	if (sub.status !== 'pending') throw error(409, 'Already reviewed');

	if (body.action === 'reject') {
		await db
			.prepare(`UPDATE submissions SET status='rejected', review_note=? WHERE id=?`)
			.bind(body.review_note ?? null, body.id)
			.run();
		return json({ ok: true, result: 'rejected' });
	}

	// approve: attach to pejabat (create one if needed)
	let pejabatId = sub.pejabat_id as number | null;
	if (!pejabatId) {
		const nama = (body.nama_pejabat ?? (sub.nama_pejabat_baru as string) ?? '').trim();
		if (!nama) throw error(400, 'nama_pejabat required for new person');
		const { slugify } = await import('#lib/utils');
		const slug = slugify(nama) || `pejabat-${Date.now()}`;
		const res = await db
			.prepare(
				`INSERT INTO pejabat (nama, slug, jabatan, instansi, partai)
				 VALUES (?, ?, ?, ?, ?)
				 ON CONFLICT(slug) DO UPDATE SET nama=excluded.nama RETURNING id`
			)
			.bind(nama, slug, body.jabatan ?? 'Anggota DPR RI', 'DPR RI', body.partai ?? null)
			.first<{ id: number }>();
		pejabatId = res?.id ?? null;
		if (!pejabatId) throw error(500, 'Failed to create pejabat');
	}

	await db
		.prepare(
			`INSERT INTO pernyataan (pejabat_id, isi, konteks, kategori, sumber_url, arsip_url, tanggal, status)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`
		)
		.bind(pejabatId, sub.isi, sub.konteks, sub.kategori, sub.sumber_url, sub.arsip_url ?? null, sub.tanggal)
		.run();

	await db.prepare(`UPDATE submissions SET status='approved', pejabat_id=? WHERE id=?`).bind(pejabatId, body.id).run();

	return json({ ok: true, result: 'approved', pejabat_id: pejabatId });
};

// PUT /api/admin → lengkapi arsip Wayback untuk pernyataan lama yang belum punya.
export const PUT: RequestHandler = async ({ request, fetch }) => {
	checkAdmin(request, getEnv());
	const db = getDB();
	const rows = await db
		.prepare(`SELECT id, sumber_url FROM pernyataan WHERE arsip_url IS NULL OR arsip_url = '' LIMIT 25`)
		.all<{ id: number; sumber_url: string }>();

	let done = 0;
	for (const row of rows.results ?? []) {
		const snap = await archiveUrl(row.sumber_url, fetch);
		if (!snap) continue;
		await db.prepare(`UPDATE pernyataan SET arsip_url = ? WHERE id = ?`).bind(snap, row.id).run();
		done++;
	}
	return json({ ok: true, checked: (rows.results ?? []).length, archived: done });
};
