import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { tulisRevisi, rapikanNama, sidikPerangkat, ambilRevisi } from '#lib/revisi';
import { renderMarkdown } from '#lib/markdown';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDB();
	const id = Number(params.id);
	if (!Number.isFinite(id)) throw error(404, 'Entri tidak ditemukan');

	const entri = await db
		.prepare(
			`SELECT p.id, p.isi, p.konteks, p.kategori, p.sumber_url, p.tanggal, p.status,
					p.jumlah_revisi, p.diverifikasi_at, pe.nama, pe.slug
			 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
			 WHERE p.id = ?`
		)
		.bind(id)
		.first<Record<string, unknown>>();

	if (!entri) throw error(404, 'Entri tidak ditemukan');

	return {
		entri,
		konteksHtml: renderMarkdown(String(entri.konteks ?? ''))
	};
};

export const actions: Actions = {
	// Sunting = tambah revisi baru, bukan menimpa. Riwayat lama tetap utuh.
	sunting: async ({ request, params }) => {
		const db = getDB();
		const id = Number(params.id);
		const fd = await request.formData();

		const isi = String(fd.get('isi') ?? '').trim();
		const konteks = String(fd.get('konteks') ?? '').trim();
		const alasan = String(fd.get('alasan') ?? '').trim();
		const oleh = rapikanNama(fd.get('oleh'));

		const gagal = (pesan: string) =>
			fail(400, { message: pesan, values: { isi, konteks, alasan, oleh: oleh ?? '' } });

		if (isi.length < 20) return gagal('Kutipan minimal 20 karakter dan harus verbatim.');
		if (isi.length > 2000) return gagal('Kutipan maksimal 2000 karakter.');
		// Kutipan wajib polos: markdown di kutipan membuka manipulasi penekanan.
		if (/(\*\*|__|`|\]\()/.test(isi))
			return gagal('Kutipan harus polos tanpa markdown. Format hanya boleh di kolom konteks.');
		if (alasan.length < 10) return gagal('Sebutkan alasan perubahan (min. 10 karakter) — ini masuk riwayat.');

		const lama = await db
			.prepare(`SELECT isi, konteks, kategori, tanggal, sumber_url, status FROM pernyataan WHERE id = ?`)
			.bind(id)
			.first<{ isi: string; konteks: string; kategori: string; tanggal: string; sumber_url: string; status: string }>();

		if (!lama) return gagal('Entri tidak ditemukan.');

		// Tidak ada perubahan nyata -> jangan buat revisi kosong.
		if (lama.isi === isi && (lama.konteks ?? '') === konteks) {
			return gagal('Tidak ada perubahan yang bisa disimpan.');
		}

		await db
			.prepare(`UPDATE pernyataan SET isi = ?, konteks = ? WHERE id = ?`)
			.bind(isi, konteks, id)
			.run();

		await tulisRevisi(db, id, {
			aksi: 'sunting',
			isi,
			konteks,
			kategori: lama.kategori,
			tanggal: lama.tanggal,
			sumber_url: lama.sumber_url,
			status: lama.status,
			catatan: alasan,
			oleh,
			olehHash: await sidikPerangkat(request)
		});

		throw redirect(303, `/entri/${id}/riwayat?disimpan=1`);
	},

	// Rollback: tulis snapshot lama sebagai revisi BARU (riwayat tidak mundur).
	pulihkan: async ({ request, params }) => {
		const db = getDB();
		const id = Number(params.id);
		const fd = await request.formData();
		const ke = Number(fd.get('revisi'));
		const oleh = rapikanNama(fd.get('oleh'));

		const target = await ambilRevisi(db, id, ke);
		if (!target) return fail(404, { message: 'Revisi tidak ditemukan.' });

		await db
			.prepare(`UPDATE pernyataan SET isi = ?, konteks = ? WHERE id = ?`)
			.bind(target.isi, target.konteks, id)
			.run();

		await tulisRevisi(db, id, {
			aksi: 'pulihkan',
			isi: target.isi,
			konteks: target.konteks,
			kategori: target.kategori,
			tanggal: target.tanggal,
			sumber_url: target.sumber_url,
			status: target.status,
			catatan: `Dikembalikan ke revisi #${ke}`,
			oleh,
			olehHash: await sidikPerangkat(request)
		});

		throw redirect(303, `/entri/${id}/riwayat?dipulihkan=${ke}`);
	}
};
