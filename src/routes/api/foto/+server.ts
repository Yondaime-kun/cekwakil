import { json, type RequestHandler } from '@sveltejs/kit';

// Sumber foto publik: cari kandidat foto + halaman Wikipedia untuk satu pejabat.
//
// Kenapa server yang query, bukan klien: Wikidata/Commons memblokir request
// tanpa User-Agent yang jelas, dan browser tidak bisa set UA. Endpoint ini
// murni BACA (tidak menulis DB); penyimpanan tetap lewat form action dengan
// konfirmasi manusia, supaya tidak ada yang bisa mengisi foto sembarangan.

const UA = 'CekWakil/1.0 (+https://cekwakil.bond; arsip pernyataan pejabat publik)';
const TIMEOUT = 8000;

export type Kandidat = {
	qid: string;
	label: string;
	deskripsi: string | null;
	foto: string | null;
	fotoAsli: string | null;
	wikipedia: string | null;
};

async function ambilJson(url: string): Promise<unknown> {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), TIMEOUT);
	try {
		const r = await fetch(url, {
			headers: { 'User-Agent': UA, Accept: 'application/json' },
			signal: ctrl.signal
		});
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		return await r.json();
	} finally {
		clearTimeout(t);
	}
}

// Nama gelar dibuang supaya pencarian Wikidata tidak gagal karena "S.H.".
// Urutannya penting: titik dibuang dulu, baru token gelar (tanpa titik)
// dicocokkan sebagai kata utuh. "H." saja sengaja tidak dibuang — banyak
// nama orang Aceh memakai "H." sebagai bagian nama, bukan gelar.
function bersihkanNama(nama: string): string {
	const tanpaTitik = nama.replace(/\./g, ' ').replace(/[,()]/g, ' ');
	return tanpaTitik
		.split(/\s+/)
		.filter((t) => t && !/^(SH|SE|SSos|ST|MM|MSi|MH|MT|SPd|SKom|SIP|Drs|Ir)$/i.test(t))
		.join(' ')
		.trim();
}

type WdSearch = {
	search?: Array<{ id: string; label?: string; description?: string }>;
};

type WdEntities = {
	entities?: Record<
		string,
		{
			claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>>;
			sitelinks?: Record<string, { title?: string }>;
		}
	>;
};

type CommonsInfo = {
	query?: {
		pages?: Record<
			string,
			{
				title?: string;
				imageinfo?: Array<{ thumburl?: string; url?: string }>;
			}
		>;
	};
};

export const GET: RequestHandler = async ({ url }) => {
	const nama = bersihkanNama(url.searchParams.get('nama') ?? '').slice(0, 80);
	if (nama.length < 3) return json({ kandidat: [] as Kandidat[], error: 'Nama terlalu pendek' });

	const cariUrl =
		'https://www.wikidata.org/w/api.php?' +
		new URLSearchParams({
			action: 'wbsearchentities',
			search: nama,
			language: 'id',
			uselang: 'id',
			limit: '6',
			format: 'json'
		});

	let hasil: WdSearch;
	try {
		hasil = (await ambilJson(cariUrl)) as WdSearch;
	} catch {
		return json({ kandidat: [] as Kandidat[], error: 'Wikidata tidak bisa dihubungi' });
	}

	const kandidatMentah = (hasil.search ?? []).slice(0, 6);
	if (kandidatMentah.length === 0) return json({ kandidat: [] as Kandidat[], error: null });

	// Ambil klaim P18 (foto) + sitelink idwiki/enwiki sekaligus, satu request.
	const ids = kandidatMentah.map((k) => k.id).join('|');
	let entitas: WdEntities = {};
	try {
		entitas = (await ambilJson(
			'https://www.wikidata.org/w/api.php?' +
				new URLSearchParams({
					action: 'wbgetentities',
					ids,
					props: 'claims|sitelinks',
					languages: 'id|en',
					sitefilter: 'idwiki|enwiki',
					format: 'json'
				})
		)) as WdEntities;
	} catch {
		// Foto gagal dimuat bukan alasan gagal total: Wikipedia tetap berguna.
	}

	// P18 menyimpan nama file (spasi jadi _). Kunci peta memakai bentuk
	// ternormalisasi itu, supaya bisa dicocokkan dengan judul dari Commons.
	const filePerQid = new Map<string, string>();
	for (const k of kandidatMentah) {
		const p18 = entitas.entities?.[k.id]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
		if (typeof p18 === 'string' && p18) filePerQid.set(k.id, p18.replace(/ /g, '_'));
	}

	// Gambar di Commons bisa hilang hak cipta/dihapus, jadi judul yang tidak
	// ditemukan memang harus dianggap "tidak ada foto".
	const thumbMap = new Map<string, { thumb: string; asli: string }>();
	if (filePerQid.size > 0) {
		const judul = [...new Set(filePerQid.values())].map((f) => `File:${f.replace(/_/g, ' ')}`).join('|');
		try {
			const info = (await ambilJson(
				'https://commons.wikimedia.org/w/api.php?' +
					new URLSearchParams({
						action: 'query',
						titles: judul,
						prop: 'imageinfo',
						iiprop: 'url',
						// Jangan minta thumbnail: URL thumb memakai host lain
						// (thumb.wikimedia.org) yang tidak stabil untuk <img>.
						iiurlwidth: '-1',
						format: 'json'
					})
			)) as CommonsInfo;
			for (const p of Object.values(info.query?.pages ?? {})) {
				// iiurlwidth=-1 -> `thumburl` kosong, `url` = file asli di
				// upload.wikimedia.org (host yang stabil). Thumbnail hanya
				// jaring pengaman kalau `url` tidak ada.
				const asli = p.imageinfo?.[0]?.url ?? null;
				const th = p.imageinfo?.[0]?.thumburl ?? asli;
				// Pakai judul halaman Commons ("File:X.jpg") sebagai kunci cocok.
				const kunci = (p.title ?? '').replace(/^File:/i, '').replace(/ /g, '_');
				if (th && asli && kunci) thumbMap.set(kunci, { thumb: th, asli });
			}
		} catch {
			// biarkan tanpa foto
		}
	}

	const kandidat: Kandidat[] = kandidatMentah.map((k) => {
		const ent = entitas.entities?.[k.id];
		const f = filePerQid.get(k.id);
		const img = f ? thumbMap.get(f) : undefined;

		const idwiki = ent?.sitelinks?.idwiki?.title;
		const enwiki = ent?.sitelinks?.enwiki?.title;
		const wiki = idwiki
			? `https://id.wikipedia.org/wiki/${encodeURIComponent(idwiki.replace(/ /g, '_'))}`
			: enwiki
				? `https://en.wikipedia.org/wiki/${encodeURIComponent(enwiki.replace(/ /g, '_'))}`
				: null;

		return {
			qid: k.id,
			label: k.label ?? k.id,
			deskripsi: k.description ?? null,
			// `foto` = yang dipakai di situs (host stabil), `fotoAsli` = kandidat
			// thumbnail kalau ada. Disimpan keduanya supaya kontributor bisa memilih.
			foto: img?.asli ?? img?.thumb ?? null,
			fotoAsli: img?.thumb ?? img?.asli ?? null,
			wikipedia: wiki
		};
	});

	return json({ kandidat, error: null });
};
