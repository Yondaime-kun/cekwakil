import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { tulisRevisi, rapikanNama, sidikPerangkat } from '#lib/revisi';

// Antrean komunitas: entri "belum diverifikasi" dan laporan terbuka bisa
// ditindak siapa pun tanpa token admin. Yang tetap butuh admin hanya hal
// destruktif (hapus permanen). Tujuannya menghilangkan bottleneck satu orang.
export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const tab = url.searchParams.get('tab') === 'laporan' ? 'laporan' : 'belum';

	const [belum, laporan, stat] = await Promise.all([
		db
			.prepare(
				`SELECT p.id, p.isi, p.konteks, p.kategori, p.tanggal, p.sumber_url, p.created_at,
						pe.nama, pe.slug
				 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE p.status = 'published' AND p.diverifikasi_at IS NULL
				 ORDER BY p.created_at ASC LIMIT 50`
			)
			.all(),
		db
			.prepare(
				`SELECT l.id, l.pernyataan_id, l.alasan, l.created_at,
						p.isi, p.status AS status_entri, pe.nama, pe.slug
				 FROM laporan l
				 JOIN pernyataan p ON p.id = l.pernyataan_id
				 JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE l.status = 'terbuka'
				 ORDER BY l.created_at ASC LIMIT 50`
			)
			.all(),
		db
			.prepare(
				`SELECT
					(SELECT COUNT(*) FROM pernyataan WHERE status='published' AND diverifikasi_at IS NULL) AS belum,
					(SELECT COUNT(*) FROM laporan WHERE status='terbuka') AS laporan,
					(SELECT COUNT(*) FROM revisions WHERE aksi IN ('setujui','tarik','sunting')) AS tindakan`
			)
			.first<{ belum: number; laporan: number; tindakan: number }>()
	]);

	return {
		tab,
		belum: belum.results ?? [],
		laporan: laporan.results ?? [],
		stat: stat ?? { belum: 0, laporan: 0, tindakan: 0 }
	};
};

export const actions: Actions = {
	// Verifikasi: entri dianggap sudah dicek terhadap sumbernya.
	verifikasi: async ({ request }) => {
		const db = getDB();
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const oleh = rapikanNama(fd.get('oleh')) ?? 'peninjau anonim';
		if (!id) return fail(400, { message: 'Entri tidak valid.' });

		const p = await db
			.prepare(`SELECT isi, konteks, kategori, tanggal, sumber_url, status FROM pernyataan WHERE id = ?`)
			.bind(id)
			.first<{
				isi: string;
				konteks: string;
				kategori: string;
				tanggal: string;
				sumber_url: string;
				status: string;
			}>();
		if (!p) return fail(404, { message: 'Entri tidak ditemukan.' });

		await db
			.prepare(
				`UPDATE pernyataan SET diverifikasi_at = datetime('now'), diverifikasi_oleh = ? WHERE id = ?`
			)
			.bind(oleh, id)
			.run();

		await tulisRevisi(db, id, {
			aksi: 'setujui',
			isi: p.isi,
			konteks: p.konteks,
			kategori: p.kategori,
			tanggal: p.tanggal,
			sumber_url: p.sumber_url,
			status: p.status,
			catatan: `Diperiksa sesuai sumber oleh ${oleh}`,
			oleh,
			olehHash: await sidikPerangkat(request)
		});

		return { message: `Entri #${id} ditandai sudah diverifikasi.` };
	},

	// Tarik oleh komunitas: sama seperti admin revert, tapi tanpa token.
	tarik: async ({ request }) => {
		const db = getDB();
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const alasan = String(fd.get('alasan') ?? '').trim();
		const oleh = rapikanNama(fd.get('oleh')) ?? 'peninjau anonim';

		if (!id) return fail(400, { message: 'Entri tidak valid.' });
		if (alasan.length < 10)
			return fail(400, { message: 'Alasan penarikan minimal 10 karakter.' });

		const p = await db
			.prepare(`SELECT isi, konteks, kategori, tanggal, sumber_url FROM pernyataan WHERE id = ?`)
			.bind(id)
			.first<{
				isi: string;
				konteks: string;
				kategori: string;
				tanggal: string;
				sumber_url: string;
			}>();
		if (!p) return fail(404, { message: 'Entri tidak ditemukan.' });

		await db
			.prepare(
				`UPDATE pernyataan SET status='rejected', reverted_at=datetime('now'), revert_reason=? WHERE id=?`
			)
			.bind(alasan, id)
			.run();

		await tulisRevisi(db, id, {
			aksi: 'tarik',
			isi: p.isi,
			konteks: p.konteks,
			kategori: p.kategori,
			tanggal: p.tanggal,
			sumber_url: p.sumber_url,
			status: 'rejected',
			catatan: alasan,
			oleh,
			olehHash: await sidikPerangkat(request)
		});

		return { message: `Entri #${id} ditarik dari publikasi.` };
	},

	// Tutup laporan tanpa menindak entri (laporan tidak berdasar).
	tutup: async ({ request }) => {
		const db = getDB();
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		if (!id) return fail(400, { message: 'Laporan tidak valid.' });
		await db.prepare(`UPDATE laporan SET status='selesai' WHERE id=?`).bind(id).run();
		return { message: 'Laporan ditandai selesai.' };
	}
};
