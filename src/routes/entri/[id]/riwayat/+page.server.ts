import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';
import { daftarRevisi, diffKata } from '#lib/revisi';
import { renderMarkdown } from '#lib/markdown';

export const load: PageServerLoad = async ({ params, url }) => {
	const db = getDB();
	const id = Number(params.id);
	if (!Number.isFinite(id)) throw error(404, 'Entri tidak ditemukan');

	const entri = await db
		.prepare(
			`SELECT p.id, p.isi, p.konteks, p.kategori, p.tanggal, p.status, p.sumber_url,
					p.jumlah_revisi, p.diverifikasi_at, p.diverifikasi_oleh, pe.nama, pe.slug
			 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id WHERE p.id = ?`
		)
		.bind(id)
		.first<Record<string, unknown>>();

	if (!entri) throw error(404, 'Entri tidak ditemukan');

	const revisi = await daftarRevisi(db, id);

	// Bandingkan tiap revisi dengan versi sebelumnya (kronologis naik).
	const urut = [...revisi].sort((a, b) => a.revisi - b.revisi);
	const daftar = urut.map((r, i) => {
		const sebelum = i > 0 ? urut[i - 1] : null;
		return {
			...r,
			konteksHtml: renderMarkdown(r.konteks ?? ''),
			diffIsi: sebelum ? diffKata(sebelum.isi, r.isi) : null,
			diffKonteks: sebelum ? diffKata(sebelum.konteks ?? '', r.konteks ?? '') : null,
			perubahanIsi: sebelum ? sebelum.isi !== r.isi : false,
			perubahanKonteks: sebelum ? (sebelum.konteks ?? '') !== (r.konteks ?? '') : false
		};
	});

	return {
		entri,
		revisi: daftar.reverse(),
		disimpan: url.searchParams.get('disimpan') === '1',
		dipulihkan: url.searchParams.get('dipulihkan')
	};
};
