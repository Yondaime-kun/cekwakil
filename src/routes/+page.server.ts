import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDB();
	const [counts, latest, sumber, terlapor, ringkas] = await Promise.all([
		db
			.prepare(
				`SELECT
					(SELECT COUNT(*) FROM pejabat) AS pejabat,
					(SELECT COUNT(*) FROM pernyataan WHERE status='published') AS pernyataan,
					(SELECT COUNT(DISTINCT partai) FROM pejabat WHERE partai IS NOT NULL) AS partai,
					(SELECT COUNT(*) FROM pejabat WHERE bio IS NOT NULL AND bio<>'') AS terverifikasi`
			)
			.first<{ pejabat: number; pernyataan: number; partai: number; terverifikasi: number }>(),
		db
			.prepare(
				`SELECT p.id, p.isi, p.konteks, p.kategori, p.tanggal, p.sumber_url, p.arsip_url, p.jumlah_revisi,
						pe.nama, pe.slug, pe.partai, pe.jabatan
				 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE p.status='published' ORDER BY p.tanggal DESC, p.id DESC LIMIT 5`
			)
			.all(),
		db
			.prepare(
				`SELECT pernyataan_id, url, arsip_url FROM sumber
				 WHERE pernyataan_id IN (
					SELECT id FROM pernyataan WHERE status='published' ORDER BY tanggal DESC, id DESC LIMIT 5
				 )`
			)
			.all<{ pernyataan_id: number; url: string; arsip_url: string | null }>(),
		db
			.prepare(
				`SELECT pe.nama, pe.slug, COUNT(*) AS jumlah
				 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE p.status='published'
				 GROUP BY pe.id ORDER BY jumlah DESC, pe.nama LIMIT 5`
			)
			.all(),
		// Konteks untuk rail "Sekilas" beranda: aktivitas & cakupan data.
		db
			.prepare(
				`SELECT
					(SELECT COUNT(*) FROM pernyataan
					  WHERE status='published' AND tanggal >= date('now','-7 day')) AS pekanIni,
					(SELECT COUNT(DISTINCT kategori) FROM pernyataan WHERE status='published') AS kategori,
					(SELECT COUNT(DISTINCT partai) FROM pejabat WHERE partai IS NOT NULL) AS partai,
					(SELECT COUNT(*) FROM pejabat
					  WHERE partai IS NULL OR partai = '') AS nonPartai,
					(SELECT MAX(tanggal) FROM pernyataan WHERE status='published') AS terakhir`
			)
			.first<{
				pekanIni: number;
				kategori: number;
				partai: number;
				nonPartai: number;
				terakhir: string | null;
			}>()
	]);

	const sumberMap: Record<number, Array<{ url: string; arsip_url: string | null }>> = {};
	for (const s of sumber.results ?? []) {
		(sumberMap[s.pernyataan_id] ??= []).push({ url: s.url, arsip_url: s.arsip_url });
	}

	return {
		counts: counts ?? { pejabat: 0, pernyataan: 0, partai: 0, terverifikasi: 0 },
		latest: latest.results ?? [],
		sumberMap,
		terlapor: terlapor.results ?? [],
		ringkas: ringkas ?? { pekanIni: 0, kategori: 0, partai: 0, nonPartai: 0, terakhir: null },
		q: url.searchParams.get('q') ?? ''
	};
};
