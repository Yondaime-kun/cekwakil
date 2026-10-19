import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDB();
	const person = await db
		.prepare(`SELECT id, nama, slug, jabatan, instansi, partai, dapil, komisi, bio, sumber_bio FROM pejabat WHERE slug = ?`)
		.bind(params.slug)
		.first<Record<string, unknown>>();
	if (!person) return { person: null };
	return { person };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const db = getDB();
		const fd = await request.formData();
		const person = await db.prepare(`SELECT id FROM pejabat WHERE slug = ?`).bind(params.slug).first<{ id: number }>();
		if (!person) return fail(404, { message: 'Pejabat tidak ditemukan.' });

		const bio = String(fd.get('bio') ?? '').trim();
		const sumberBio = String(fd.get('sumber_bio') ?? '').trim();
		const partai = String(fd.get('partai') ?? '').trim();
		const jabatan = String(fd.get('jabatan') ?? '').trim();
		const komisi = String(fd.get('komisi') ?? '').trim();
		const dapil = String(fd.get('dapil') ?? '').trim();

		if (bio && !/^https?:\/\//i.test(sumberBio)) {
			return fail(400, { message: 'Bio wajib disertai tautan sumber yang bisa diperiksa.' });
		}

		await db
			.prepare(
				`UPDATE pejabat SET
				   bio = CASE WHEN ? != '' THEN ? ELSE bio END,
				   sumber_bio = CASE WHEN ? != '' THEN ? ELSE sumber_bio END,
				   partai = CASE WHEN ? != '' THEN ? ELSE partai END,
				   jabatan = CASE WHEN ? != '' THEN ? ELSE jabatan END,
				   komisi = CASE WHEN ? != '' THEN ? ELSE komisi END,
				   dapil = CASE WHEN ? != '' THEN ? ELSE dapil END
				 WHERE id = ?`
			)
			.bind(bio, bio, sumberBio, sumberBio, partai, partai, jabatan, jabatan, komisi, komisi, dapil, dapil, person.id)
			.run();

		return { ok: true };
	}
};
