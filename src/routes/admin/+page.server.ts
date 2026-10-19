import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, getEnv } from '#lib/db';

function checkAdmin(cookies: { get(name: string): string | undefined }): boolean {
	return cookies.get('admin_session') === 'yes';
}

export const load: PageServerLoad = async ({ cookies }) => {
	if (!checkAdmin(cookies)) {
		return {
			auth: false,
			terbaru: [],
			dilaporkan: [],
			dibatalkan: [],
			total: 0,
			pernyataan: 0,
			kandidat: 0
		};
	}
	const db = getDB();
	const terbaru = await db
		.prepare(
			`SELECT p.id, p.isi, p.kategori, p.tanggal, p.created_at, pe.nama, pe.slug
			 FROM pernyataan p LEFT JOIN pejabat pe ON pe.id = p.pejabat_id
			 WHERE p.status = 'published'
			 ORDER BY p.id DESC LIMIT 40`
		)
		.all();
	const dilaporkan = await db
		.prepare(
			`SELECT l.id, l.pernyataan_id, l.alasan, l.status, l.created_at
			 FROM laporan l ORDER BY l.id DESC LIMIT 40`
		)
		.all();
	const dibatalkan = await db
		.prepare(
			`SELECT p.id, p.isi, p.revert_reason, p.reverted_at, pe.nama
			 FROM pernyataan p LEFT JOIN pejabat pe ON pe.id = p.pejabat_id
			 WHERE p.status = 'rejected' AND p.reverted_at IS NOT NULL
			 ORDER BY p.id DESC LIMIT 20`
		)
		.all();
	const stat = await db
		.prepare(
			`SELECT (SELECT COUNT(*) FROM pernyataan WHERE status='published') AS pernyataan,
			        (SELECT COUNT(*) FROM pejabat) AS total,
			        (SELECT COUNT(*) FROM pernyataan WHERE arsip_url IS NULL OR arsip_url='') AS kandidat`
		)
		.first<{ pernyataan: number; total: number; kandidat: number }>();

	return {
		auth: true,
		terbaru: terbaru.results ?? [],
		dilaporkan: dilaporkan.results ?? [],
		dibatalkan: dibatalkan.results ?? [],
		total: stat?.total ?? 0,
		pernyataan: stat?.pernyataan ?? 0,
		kandidat: stat?.kandidat ?? 0
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const fd = await request.formData();
		const token = String(fd.get('token') ?? '');
		if (token && token === getEnv().ADMIN_TOKEN) {
			cookies.set('admin_session', 'yes', {
				path: '/admin',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 12
			});
			return { ok: true };
		}
		return fail(401, { wrong: true });
	},
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/admin' });
		return { ok: true };
	},
	// Revert ala wiki: tarik dari publikasi, catat alasan, tidak hapus permanen.
	revert: async ({ request, cookies }) => {
		if (!checkAdmin(cookies)) return fail(401, { wrong: true });
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const alasan = String(fd.get('alasan') ?? '').trim() || 'Tidak sesuai sumber';
		const db = getDB();
		await db
			.prepare(
				`UPDATE pernyataan SET status='rejected', reverted_at=datetime('now'), revert_reason=?
				 WHERE id=?`
			)
			.bind(alasan, id)
			.run();
		return { ok: true, message: `Entri #${id} ditarik dari publikasi.` };
	},
	pulihkan: async ({ request, cookies }) => {
		if (!checkAdmin(cookies)) return fail(401, { wrong: true });
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const db = getDB();
		await db
			.prepare(
				`UPDATE pernyataan SET status='published', reverted_at=NULL, revert_reason=NULL WHERE id=?`
			)
			.bind(id)
			.run();
		return { ok: true, message: `Entri #${id} tayang lagi.` };
	},
	tutupLaporan: async ({ request, cookies }) => {
		if (!checkAdmin(cookies)) return fail(401, { wrong: true });
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		await getDB().prepare(`UPDATE laporan SET status='selesai' WHERE id=?`).bind(id).run();
		return { ok: true };
	},
	// Import balik dari file export (JSON) — untuk mirror & restore.
	import: async ({ request, cookies, fetch, url }) => {
		if (!checkAdmin(cookies)) return fail(401, { wrong: true });
		const fd = await request.formData();
		const file = fd.get('berkas');
		const dariUrl = String(fd.get('dari_url') ?? '').trim();

		let teks = '';
		try {
			if (file instanceof File && file.size > 0) {
				teks = await file.text();
			} else if (dariUrl) {
				const res = await fetch(dariUrl, { headers: { accept: 'application/json' } });
				if (!res.ok) return fail(400, { message: `Gagal ambil URL (HTTP ${res.status})` });
				teks = await res.text();
			} else {
				return fail(400, { message: 'Pilih berkas JSON atau isi URL export.' });
			}

			JSON.parse(teks); // validasi awal supaya error jelas
		} catch {
			return fail(400, { message: 'Berkas bukan JSON valid.' });
		}

		const res = await fetch(`${url.origin}/api/import`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${getEnv().ADMIN_TOKEN as string}`
			},
			body: teks
		});
		const hasil = (await res.json()) as {
			masuk?: number;
			dilewati?: number;
			total?: number;
			error?: string;
		};
		if (!res.ok) return fail(400, { message: `Import gagal: ${hasil.error ?? res.status}` });

		return {
			ok: true,
			message: `Import selesai: ${hasil.masuk} masuk, ${hasil.dilewati} dilewati (duplikat/kosong) dari ${hasil.total} entri.`
		};
	}
};
