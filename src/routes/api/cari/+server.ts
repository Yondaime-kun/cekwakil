import { json, type RequestHandler } from '@sveltejs/kit';
import { getDB } from '#lib/db';

// Pencarian cepat untuk dialog ⌘K: pejabat + kutipan, masing-masing dibatasi.
// Sengaja ringan: dipanggil on-type dengan debounce dari klien.

type PejabatRow = { slug: string; nama: string; jabatan: string; partai: string | null };
type PernyataanRow = {
	id: number;
	isi: string;
	tanggal: string;
	kategori: string;
	nama: string;
	slug: string;
};

export const GET: RequestHandler = async ({ url }) => {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
	if (q.length < 2) return json({ pejabat: [], pernyataan: [], total: 0 });

	const like = `%${q}%`;
	const db = getDB();

	const [pejabat, pernyataan] = await Promise.all([
		db
			.prepare(
				`SELECT slug, nama, jabatan, partai FROM pejabat
				 WHERE nama LIKE ? OR partai LIKE ? OR dapil LIKE ? OR komisi LIKE ?
				 ORDER BY (nama LIKE ?) DESC, nama LIMIT 5`
			)
			.bind(like, like, like, like, `${q}%`)
			.all<PejabatRow>(),
		db
			.prepare(
				`SELECT p.id, p.isi, p.tanggal, p.kategori, pe.nama, pe.slug
				 FROM pernyataan p JOIN pejabat pe ON pe.id = p.pejabat_id
				 WHERE p.status='published' AND (p.isi LIKE ? OR p.konteks LIKE ? OR pe.nama LIKE ?)
				 ORDER BY p.tanggal DESC LIMIT 5`
			)
			.bind(like, like, like)
			.all<PernyataanRow>()
	]);

	return json({
		pejabat: pejabat.results ?? [],
		pernyataan: pernyataan.results ?? [],
		total: (pejabat.results?.length ?? 0) + (pernyataan.results?.length ?? 0)
	});
};
