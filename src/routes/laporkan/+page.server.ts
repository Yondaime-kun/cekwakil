import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getDB } from '#lib/db';

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('pernyataan_id'));
		const alasan = String(fd.get('alasan') ?? '').trim();
		if (!id || alasan.length < 10) {
			return fail(400, { message: 'Alasan minimal 10 karakter.' });
		}
		const db = getDB();
		const ada = await db.prepare(`SELECT id FROM pernyataan WHERE id = ?`).bind(id).first();
		if (!ada) return fail(404, { message: 'Entri tidak ditemukan.' });
		await db.prepare(`INSERT INTO laporan (pernyataan_id, alasan) VALUES (?, ?)`).bind(id, alasan).run();
		return { ok: true };
	}
};
