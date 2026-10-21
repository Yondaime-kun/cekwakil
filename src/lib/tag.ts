import { slugify } from '#lib/utils';
import { rapikanLabel } from '#lib/markdown';

// Tag = taksonomi bebas di samping kategori tetap. Kategori menjawab
// "apa jenisnya", tag menjawab "soal apa" (anggaran, etik, MBG, ...).
const MAKS_TAG = 5;

/** Pecah input mentah "a, b, c" atau "#a #b" jadi slug unik & valid. */
export function parseTag(mentah: string): string[] {
	const hasil: string[] = [];
	for (const bagian of mentah.split(/[,\n#]+/)) {
		const s = slugify(bagian).slice(0, 32);
		if (s.length < 2) continue;
		if (!hasil.includes(s)) hasil.push(s);
		if (hasil.length >= MAKS_TAG) break;
	}
	return hasil;
}

/** Pastikan setiap slug ada di tabel tag, lalu kembalikan id-nya. */
export async function pastikanTag(db: D1Database, slugs: string[]): Promise<number[]> {
	const ids: number[] = [];
	for (const slug of slugs) {
		await db
			.prepare(`INSERT INTO tag (slug, label) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING`)
			.bind(slug, rapikanLabel(slug))
			.run();
		const row = await db.prepare(`SELECT id FROM tag WHERE slug = ?`).bind(slug).first<{ id: number }>();
		if (row) ids.push(row.id);
	}
	return ids;
}

/** Ganti seluruh tag sebuah entri. */
export async function simpanTag(db: D1Database, pernyataanId: number, slugs: string[]): Promise<void> {
	await db.prepare(`DELETE FROM pernyataan_tag WHERE pernyataan_id = ?`).bind(pernyataanId).run();
	const ids = await pastikanTag(db, slugs);
	for (const tagId of ids) {
		await db
			.prepare(`INSERT OR IGNORE INTO pernyataan_tag (pernyataan_id, tag_id) VALUES (?, ?)`)
			.bind(pernyataanId, tagId)
			.run();
	}
}

/** Tag untuk banyak entri sekaligus (hindari N+1 query di daftar). */
export async function tagEntri(
	db: D1Database,
	ids: number[]
): Promise<Record<number, Array<{ slug: string; label: string }>>> {
	const map: Record<number, Array<{ slug: string; label: string }>> = {};
	if (ids.length === 0) return map;
	const ph = ids.map(() => '?').join(',');
	const r = await db
		.prepare(
			`SELECT pt.pernyataan_id, t.slug, t.label
			 FROM pernyataan_tag pt JOIN tag t ON t.id = pt.tag_id
			 WHERE pt.pernyataan_id IN (${ph}) ORDER BY t.label`
		)
		.bind(...ids)
		.all<{ pernyataan_id: number; slug: string; label: string }>();
	for (const row of r.results ?? []) {
		(map[row.pernyataan_id] ??= []).push({ slug: row.slug, label: row.label });
	}
	return map;
}

/** Tag populer untuk chip filter. */
export async function tagPopuler(db: D1Database, limit = 12) {
	const r = await db
		.prepare(
			`SELECT t.slug, t.label, COUNT(*) AS c
			 FROM pernyataan_tag pt
			 JOIN tag t ON t.id = pt.tag_id
			 JOIN pernyataan p ON p.id = pt.pernyataan_id AND p.status='published'
			 GROUP BY t.id ORDER BY c DESC, t.label LIMIT ?`
		)
		.bind(limit)
		.all<{ slug: string; label: string; c: number }>();
	return r.results ?? [];
}
