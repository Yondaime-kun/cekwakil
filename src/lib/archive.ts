// Helper bersama: arsip sumber via Wayback Machine.
// Dua jalur: CDX (cari snapshot yang sudah ada, murah) lalu Save Page Now.
// archive.org membalas 429 untuk burst request, jadi semua kegagalan
// dikembalikan sebagai null — submit tidak boleh gagal karena arsip.

const CDX = 'https://web.archive.org/cdx/search/cdx';
const SAVE = 'https://web.archive.org/save/';

export function waybackSnapshotUrl(url: string, timestamp?: string): string {
	const stamp = (timestamp ?? '').replace(/\D/g, '').slice(0, 14);
	return stamp
		? `https://web.archive.org/web/${stamp}/${url}`
		: `https://web.archive.org/web/2/${url}`;
}

/** Snapshot terbaru yang sudah ada (tanpa memicu pengarsipan baru). */
async function findExisting(url: string, fetchImpl: typeof fetch): Promise<string | null> {
	try {
		const res = await fetchImpl(
			`${CDX}?url=${encodeURIComponent(url)}&output=json&limit=-1&filter=statuscode:200&fl=timestamp`,
			{ headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
		);
		if (!res.ok) return null;
		const rows = (await res.json()) as string[][];
		const last = rows.length > 1 ? rows[rows.length - 1]?.[0] : null;
		return last ? waybackSnapshotUrl(url, last) : null;
	} catch {
		return null;
	}
}

/** Minta Wayback mengarsipkan sekarang; balikan URL snapshot bila selesai. */
async function saveNow(url: string, fetchImpl: typeof fetch): Promise<string | null> {
	try {
		const res = await fetchImpl(`${SAVE}/${url}`, {
			method: 'GET',
			redirect: 'follow',
			signal: AbortSignal.timeout(20000)
		});
		const stamp = res.url.match(/\/web\/(\d{8,14})\//)?.[1];
		if (stamp) return waybackSnapshotUrl(url, stamp);
	} catch {
		// rate limited / timeout
	}
	return null;
}

export async function archiveUrl(url: string, fetchImpl: typeof fetch): Promise<string | null> {
	const existing = await findExisting(url, fetchImpl);
	if (existing) return existing;
	return saveNow(url, fetchImpl);
}
