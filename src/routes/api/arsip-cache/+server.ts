import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getDB, getEnv } from '#lib/db';

// Cache hasil backfill arsip (dipanggil scripts/backfill-arsip.mjs).
// Simpan pemetaan url -> snapshot terakhir; dipakai saat membaca arsip.
// Auth: token admin.

function checkAdmin(request: Request, env: Record<string, unknown>): void {
	const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	if (!token || token !== env.ADMIN_TOKEN) throw error(401, 'Unauthorized');
}

export const POST: RequestHandler = async ({ request }) => {
	checkAdmin(request, getEnv());
	const body = (await request.json()) as { url?: string; stamp?: string };
	const url = (body.url ?? '').trim();
	const stamp = (body.stamp ?? '').replace(/\D/g, '').slice(0, 14);
	if (!/^https?:\/\//i.test(url) || !stamp) throw error(400, 'url dan stamp wajib');

	const db = getDB();
	const snap = `https://web.archive.org/web/${stamp}/${url}`;

	// Simpan di semua baris yang memakai url ini dan belum punya arsip.
	const upd = await db
		.prepare(`UPDATE pernyataan SET arsip_url=? WHERE (arsip_url IS NULL OR arsip_url='') AND sumber_url=?`)
		.bind(snap, url)
		.run();
	const upd2 = await db
		.prepare(`UPDATE sumber SET arsip_url=? WHERE (arsip_url IS NULL OR arsip_url='') AND url=?`)
		.bind(snap, url)
		.run();

	return json({
		ok: true,
		url,
		snap,
		pernyataan: upd.meta.changes ?? 0,
		sumber: upd2.meta.changes ?? 0
	});
};
