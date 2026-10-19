import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { slugify } from '#lib/utils';
import { normalisasiNama } from '#lib/nama';

export const load: PageServerLoad = async () => {
	return { pesan: null as string | null };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const nama = String(fd.get('nama') ?? '').trim();
		const jabatan = String(fd.get('jabatan') ?? '').trim();
		const partai = String(fd.get('partai') ?? '').trim();
		const dapil = String(fd.get('dapil') ?? '').trim();
		const komisi = String(fd.get('komisi') ?? '').trim();
		const suaraRaw = String(fd.get('suara') ?? '').replace(/\D/g, '');
		const sumberUrl = String(fd.get('sumber_url') ?? '').trim();

		if (nama.length < 3) return fail(400, { message: 'Nama minimal 3 karakter.', values: { nama } });
		if (!jabatan) return fail(400, { message: 'Jabatan wajib diisi (mis. Anggota DPR RI).', values: { nama } });
		if (!/^https?:\/\//i.test(sumberUrl))
			return fail(400, { message: 'Wajib tautan sumber profil (mis. Wikipedia atau halaman resmi).', values: { nama } });

		const db = getDB();

		// Dedupe: nama yang sudah dinormalisasi harus tidak ada yang cocok.
		const norm = normalisasiNama(nama);
		const twin = await db
			.prepare(
				`SELECT pe.slug FROM pejabat_nama_norm n JOIN pejabat pe ON pe.id = n.pejabat_id
				 WHERE n.nama_norm = ? LIMIT 1`
			)
			.bind(norm)
			.first<{ slug: string }>();
		if (twin) {
			return fail(409, { message: `Pejabat dengan nama serupa sudah terdaftar.`, slug: twin.slug, values: { nama } });
		}

		let slug = slugify(nama);
		const adaSlug = await db.prepare(`SELECT id FROM pejabat WHERE slug=?`).bind(slug).first();
		if (adaSlug) slug = `${slug}-${Date.now().toString(36)}`;

		const ins = await db
			.prepare(
				`INSERT INTO pejabat (nama, slug, jabatan, instansi, partai, dapil, komisi, suara)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				nama,
				slug,
				jabatan,
				jabatan.toLowerCase().includes('menteri') ? 'Kabinet Merah Putih' : 'DPR RI',
				partai || null,
				dapil || null,
				komisi || null,
				suaraRaw ? Number(suaraRaw) : null
			)
			.run();

		const pid = Number(ins.meta.last_row_id);
		await db.prepare(`INSERT INTO pejabat_nama_norm (pejabat_id, nama_norm) VALUES (?, ?)`).bind(pid, norm).run();

		return { ok: true, slug };
	}
};
