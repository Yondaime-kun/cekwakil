import type { PageServerLoad } from './$types';
import { getDB } from '#lib/db';

export const load: PageServerLoad = async () => {
	const db = getDB();
	const [counts, latest] = await Promise.all([
		db
			.prepare(
				`SELECT
					(SELECT COUNT(*) FROM pejabat) AS pejabat,
					(SELECT COUNT(*) FROM pernyataan WHERE status='published') AS pernyataan,
					(SELECT COUNT(DISTINCT partai) FROM pejabat WHERE partai IS NOT NULL) AS partai`
			)
			.first<{ pejabat: number; pernyataan: number; partai: number }>(),
		db
			.prepare(
				`SELECT p.id, p.isi, p.kategori, p.tanggal, pe.nama, pe.slug, pe.partai, pe.jabatan
				 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE p.status='published' ORDER BY p.tanggal DESC LIMIT 5`
			)
			.all()
	]);

	return {
		counts: counts ?? { pejabat: 0, pernyataan: 0, partai: 0 },
		latest: latest.results ?? []
	};
};
