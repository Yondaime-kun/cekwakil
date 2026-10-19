// Backfill arsip Wayback untuk pernyataan & sumber yang belum punya snapshot.
// Dijalankan dari mesin lokal (IP residensial) karena archive.org membatasi
// IP Cloudflare Workers (429 Too Many Requests).
//
// Pakai:
//   ADMIN_TOKEN=$(cat /tmp/admin_token.txt) BASE=https://cekwakil.cekwakil0.workers.dev \
//     node scripts/backfill-arsip.mjs [batch=25]

const BASE = process.env.BASE ?? 'https://cekwakil.cekwakil0.workers.dev';
const TOKEN = process.env.ADMIN_TOKEN;
const BATCH = Number(process.argv[2] ?? 25) || 25;
const DELAY_MS = 4000; // archive.org sensitif; jangan burst

if (!TOKEN) {
	console.error('ADMIN_TOKEN belum diset.');
	process.exit(1);
}

const CDX = 'https://web.archive.org/cdx/search/cdx';
const SAVE = 'https://web.archive.org/save/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function snapshotUrl(url, stamp) {
	const s = (stamp ?? '').replace(/\D/g, '').slice(0, 14);
	return s ? `https://web.archive.org/web/${s}/${url}` : null;
}

async function findExisting(url) {
	try {
		const res = await fetch(`${CDX}?url=${encodeURIComponent(url)}&output=json&limit=-1&filter=statuscode:200&fl=timestamp`, {
			headers: { accept: 'application/json' }
		});
		if (!res.ok) return null;
		const rows = await res.json();
		return rows.length > 1 ? rows[rows.length - 1]?.[0] : null;
	} catch {
		return null;
	}
}

async function saveNow(url) {
	try {
		const res = await fetch(`${SAVE}${url}`, { redirect: 'follow' });
		// SPN bisa balas 200 di /save/ sebelum proses selesai; coba baca job ID dari body.
		let m = res.url.match(/\/web\/(\d{8,14})\//);
		if (m) return m[1];
		// snapshot mungkin sudah tersedia walau redirect belum ke /web/
		return await findExisting(url);
	} catch {
		return null;
	}
}

async function kandidat() {
	// Ambil daftar URL yang belum diarsipkan, baik di pernyataan maupun tabel sumber.
	const res = await fetch(`${BASE}/api/export?format=json&limit=20000`);
	const data = (await res.json()).data ?? [];
	const kotor = new Set();
	for (const e of data) {
		if (e.sumber_url) kotor.add(e.sumber_url);
		for (const s of e.sumber ?? []) if (s.url) kotor.add(s.url);
	}
	return [...kotor];
}

async function main() {
	const semua = await kandidat();
	console.log(`${semua.length} URL unik untuk diperiksa. Batch ${BATCH}, jeda ${DELAY_MS / 1000}s.`);

	let diarsipkan = 0;
	for (const url of semua.slice(0, BATCH)) {
		let stamp = await findExisting(url);
		let cara = 'cdx';
		if (!stamp) {
			stamp = await saveNow(url);
			cara = 'save';
			await sleep(DELAY_MS);
		}
		if (stamp) {
			diarsipkan++;
			console.log(`[${cara}] ${snapshotUrl(url, stamp)}`);
			// Simpan hasil ke API admin untuk di-cache ke DB.
			await fetch(`${BASE}/api/arsip-cache`, {
				method: 'POST',
				headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` },
				body: JSON.stringify({ url, stamp })
			});
		} else {
			console.log(`[gagal] ${url}`);
		}
		await sleep(DELAY_MS);
	}
	console.log(`Selesai: ${diarsipkan}/${Math.min(BATCH, semua.length)} diarsipkan.`);
}

main();
