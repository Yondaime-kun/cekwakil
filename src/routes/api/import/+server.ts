import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getDB, getEnv } from '#lib/db';
import { slugify } from '#lib/utils';

// Import balik dari export CekWakil (format JSON /api/export?format=json).
// Dipakai untuk mirror & restore. Butuh token admin supaya tidak bisa
// dipakai spam oleh siapa pun yang menemukan endpoint ini.

type Entri = {
	id?: number;
	isi?: string;
	konteks?: string;
	kategori?: string;
	sumber_url?: string;
	arsip_url?: string;
	tanggal?: string;
	pejabat_nama?: string;
	pejabat_slug?: string;
	jabatan?: string;
	partai?: string;
	dapil?: string;
	komisi?: string;
	sumber?: Array<{ url: string; arsip_url?: string | null }>;
};

function checkAdmin(request: Request, env: Record<string, unknown>): void {
	const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	if (!token || token !== env.ADMIN_TOKEN) throw error(401, 'Unauthorized');
}

export const POST: RequestHandler = async ({ request }) => {
	checkAdmin(request, getEnv());
	const db = getDB();

	let payload: { data?: Entri[] } | Entri[];
	try {
		payload = (await request.json()) as { data?: Entri[] } | Entri[];
	} catch {
		throw error(400, 'Body bukan JSON valid');
	}

	const daftar: Entri[] = Array.isArray(payload) ? payload : (payload.data ?? []);
	if (daftar.length === 0) throw error(400, 'Tidak ada entri untuk diimpor');

	let masuk = 0;
	let dilewati = 0;
	const gagal: string[] = [];

	for (const e of daftar) {
		const isi = (e.isi ?? '').trim();
		const tanggal = (e.tanggal ?? '').slice(0, 10);
		if (!isi || !tanggal) {
			dilewati++;
			continue;
		}

		try {
			// Pejabat: cocokkan lewat slug, buat kalau belum ada.
			const nama = (e.pejabat_nama ?? '').trim() || 'Tanpa nama';
			const slug = (e.pejabat_slug ?? '').trim() || slugify(nama);
			const pj = await db
				.prepare(
					`INSERT INTO pejabat (nama, slug, jabatan, instansi, partai, dapil, komisi)
					 VALUES (?, ?, ?, ?, ?, ?, ?)
					 ON CONFLICT(slug) DO UPDATE SET nama=excluded.nama
					 RETURNING id`
				)
				.bind(
					nama,
					slug,
					(e.jabatan ?? '').trim() || 'Anggota DPR RI',
					(e.jabatan ?? '').toLowerCase().includes('menteri') ? 'Kabinet Merah Putih' : 'DPR RI',
					(e.partai ?? '').trim() || null,
					(e.dapil ?? '').trim() || null,
					(e.komisi ?? '').trim() || null
				)
				.first<{ id: number }>();
			if (!pj) throw new Error('gagal buat pejabat');

			// Jangan duplikat: isi + tanggal + pejabat sama = sudah ada.
			const ada = await db
				.prepare(
					`SELECT id FROM pernyataan WHERE pejabat_id=? AND isi=? AND tanggal=? LIMIT 1`
				)
				.bind(pj.id, isi, tanggal)
				.first<{ id: number }>();
			if (ada) {
				dilewati++;
				continue;
			}

			const sumberList =
				e.sumber && e.sumber.length > 0
					? e.sumber
					: e.sumber_url
						? [{ url: e.sumber_url, arsip_url: e.arsip_url }]
						: [];

			const ins = await db
				.prepare(
					`INSERT INTO pernyataan (pejabat_id, isi, konteks, kategori, sumber_url, arsip_url, tanggal, status)
					 VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`
				)
				.bind(
					pj.id,
					isi,
					(e.konteks ?? '').trim(),
					(e.kategori ?? '').trim() || 'lainnya',
					sumberList[0]?.url ?? '',
					sumberList[0]?.arsip_url ?? null,
					tanggal
				)
				.run();

			const pid = Number(ins.meta.last_row_id);
			for (const s of sumberList) {
				await db
					.prepare(`INSERT INTO sumber (pernyataan_id, url, arsip_url) VALUES (?, ?, ?)`)
					.bind(pid, s.url, s.arsip_url ?? null)
					.run();
			}
			masuk++;
		} catch (err) {
			gagal.push(`${(e.pejabat_nama ?? 'tanpa nama').slice(0, 40)}: ${String(err).slice(0, 80)}`);
		}
	}

	return json({ ok: true, masuk, dilewati, gagal: gagal.slice(0, 10), total: daftar.length });
};
