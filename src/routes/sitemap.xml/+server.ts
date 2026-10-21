import type { RequestHandler } from '@sveltejs/kit';
import { getDB } from '#lib/db';
import { SITE_URL } from '#lib/site';

// Sitemap dinamis: halaman statis + seluruh profil pejabat.
// Tanpa ini, 616 profil hanya bisa ditemukan lewat pencarian internal.
export const GET: RequestHandler = async () => {
	const db = getDB();
	const pejabat = await db
		.prepare(`SELECT slug FROM pejabat ORDER BY nama`)
		.all<{ slug: string }>();

	const statis = [
		{ path: '/', prio: '1.0', freq: 'daily' },
		{ path: '/blunder', prio: '0.9', freq: 'daily' },
		{ path: '/pejabat', prio: '0.8', freq: 'weekly' },
		{ path: '/harta', prio: '0.6', freq: 'weekly' },
		{ path: '/panduan', prio: '0.5', freq: 'monthly' },
		{ path: '/submit', prio: '0.4', freq: 'monthly' }
		// /tinjau dan /entri/* sengaja tidak didaftarkan: noindex, bukan konten publik.
	];

	const urls = [
		...statis.map(
			(s) =>
				`<url><loc>${SITE_URL}${s.path}</loc><changefreq>${s.freq}</changefreq><priority>${s.prio}</priority></url>`
		),
		...(pejabat.results ?? []).map(
			(p) =>
				`<url><loc>${SITE_URL}/pejabat/${encodeURIComponent(p.slug)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
		)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
