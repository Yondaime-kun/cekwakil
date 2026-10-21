import { fail, type Actions } from '@sveltejs/kit';
import { getDB } from '#lib/db';
import { validateSubmission, slugify } from '#lib/utils';
import { archiveUrl } from '#lib/archive';
import { normalisasiNama } from '#lib/nama';
import { parseTag, simpanTag } from '#lib/tag';
import { tulisRevisi, rapikanNama, sidikPerangkat } from '#lib/revisi';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const rows = await db
		.prepare(`SELECT id, nama, slug, jabatan, partai FROM pejabat ORDER BY nama`)
		.all();
	const pejabat = rows.results ?? [];

	// Tombol "+ Kutipan untuk dia" di profil mengirim ?pejabat=<slug>,
	// jadi form langsung terisi orangnya tanpa harus mencari ulang.
	const slug = (url.searchParams.get('pejabat') ?? '').trim();
	const terpilih = slug ? (pejabat.find((p) => (p as { slug: string }).slug === slug) ?? null) : null;

	return { pejabat, terpilih };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const db = getDB();
		const form = await request.formData();
		const body = Object.fromEntries(form.entries());
		const errors = validateSubmission(body);
		if (errors.length > 0) return fail(400, { errors, values: body });

		// Multi-sumber: field sumber_url bisa dikirim berkali-kali.
		const daftarSumber = form
			.getAll('sumber_url')
			.map((s) => String(s).trim())
			.filter((s) => /^https?:\/\//i.test(s));
		if (daftarSumber.length === 0) {
			return fail(400, { errors: ['Minimal satu tautan sumber yang valid.'], values: body });
		}

		const pejabatId = body.pejabat_id ? parseInt(String(body.pejabat_id)) || null : null;
		const namaBaru = !pejabatId ? String(body.nama_pejabat_baru ?? '').trim() : '';
		const isi = String(body.isi).trim();
		const konteks = String(body.konteks ?? '').trim();
		const kategori = String(body.kategori);
		const tanggal = String(body.tanggal).slice(0, 10);

		// Arsipkan tiap sumber supaya bukti tetap ada kalau link mati.
		const arsipList = await Promise.all(daftarSumber.map((u) => archiveUrl(u, fetch)));

		let targetId = pejabatId;
		if (!targetId) {
			if (!namaBaru) {
				return fail(400, { errors: ['Nama pejabat wajib diisi kalau belum memilih dari daftar.'], values: body });
			}
			// Dedupe: cek nama yang sudah dinormalisasi sebelum membuat profil baru.
			const norm = normalisasiNama(namaBaru);
			const twin = await db
				.prepare(
					`SELECT n.pejabat_id AS id, pe.nama FROM pejabat_nama_norm n
					 JOIN pejabat pe ON pe.id = n.pejabat_id
					 WHERE n.nama_norm = ? LIMIT 1`
				)
				.bind(norm)
				.first<{ id: number; nama: string }>();
			if (twin) {
				targetId = twin.id;
			} else {
				const slug = slugify(namaBaru) || `pejabat-${Date.now()}`;
				const made = await db
					.prepare(
						`INSERT INTO pejabat (nama, slug, jabatan, instansi)
						 VALUES (?, ?, 'Anggota DPR RI', 'DPR RI')
						 ON CONFLICT(slug) DO UPDATE SET nama=excluded.nama RETURNING id`
					)
					.bind(namaBaru, slug)
					.first<{ id: number }>();
				targetId = made?.id ?? null;
				if (targetId) {
					await db
						.prepare(`INSERT INTO pejabat_nama_norm (pejabat_id, nama_norm) VALUES (?, ?)`)
						.bind(targetId, norm)
						.run();
				}
			}
		}
		if (!targetId) {
			return fail(500, { errors: ['Gagal menyiapkan profil pejabat.'], values: body });
		}

		// Langsung tayang (model wiki). Moderasi terjadi setelah publikasi.
		const ins = await db
			.prepare(
				`INSERT INTO pernyataan
				 (pejabat_id, isi, konteks, kategori, sumber_url, arsip_url, tanggal, status, submitter)
				 VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)`
			)
			.bind(
				targetId,
				isi,
				konteks,
				kategori,
				daftarSumber[0],
				arsipList[0] ?? null,
				tanggal,
				String(body.submitter ?? '').trim() || null
			)
			.run();

		const pernyataanId = Number(ins.meta.last_row_id);

		// Revisi #1 + tag: entri baru sengaja BELUM diverifikasi (kolom
		// diverifikasi_at dibiarkan NULL) supaya masuk antrean /tinjau.
		await tulisRevisi(db, pernyataanId, {
			aksi: 'buat',
			isi,
			konteks,
			kategori,
			tanggal,
			sumber_url: daftarSumber[0],
			status: 'published',
			catatan: 'Dikirim publik',
			oleh: rapikanNama(body.submitter),
			olehHash: await sidikPerangkat(request)
		});
		await simpanTag(db, pernyataanId, parseTag(String(body.tag ?? '')));

		for (let i = 0; i < daftarSumber.length; i++) {
			await db
				.prepare(`INSERT INTO sumber (pernyataan_id, url, arsip_url) VALUES (?, ?, ?)`)
				.bind(pernyataanId, daftarSumber[i], arsipList[i] ?? null)
				.run();
		}

		return { success: true, id: pernyataanId };
	}
};
