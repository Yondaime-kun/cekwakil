// Helper alur revisi: setiap perubahan entri WAJIB menulis satu baris revisi.
// Ini yang membuat riwayat tidak bisa hilang dan rollback jadi mungkin.

export type AksiRevisi = 'buat' | 'sunting' | 'tarik' | 'pulihkan' | 'setujui';

export interface SnapshotRevisi {
	pernyataan_id: number;
	revisi: number;
	aksi: AksiRevisi;
	isi: string;
	konteks: string;
	kategori: string;
	tanggal: string;
	sumber_url: string;
	status: string;
	catatan: string | null;
	oleh: string | null;
	oleh_hash: string | null;
}

/** Nama kontributor: dipakai apa adanya, dibatasi panjangnya. */
export function rapikanNama(mentah: unknown): string | null {
	const n = String(mentah ?? '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 60);
	return n || null;
}

/**
 * Sidik perangkat dari header request — BUKAN identitas dan bukan IP mentah.
 * Tujuannya hanya membedakan "orang yang sama mengedit lagi" untuk mendeteksi
 * spam, tanpa menyimpan data pribadi.
 */
export async function sidikPerangkat(request: Request): Promise<string | null> {
	const ua = request.headers.get('user-agent') ?? '';
	if (!ua) return null;
	const bahasa = request.headers.get('accept-language') ?? '';
	const data = new TextEncoder().encode(`${ua}|${bahasa}`);
	const buf = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(buf)]
		.slice(0, 6)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/** Tulis satu revisi baru (revisi = nomor tertinggi + 1). */
export async function tulisRevisi(
	db: D1Database,
	pernyataanId: number,
	data: {
		aksi: AksiRevisi;
		isi: string;
		konteks: string;
		kategori: string;
		tanggal: string;
		sumber_url: string;
		status: string;
		catatan?: string | null;
		oleh?: string | null;
		olehHash?: string | null;
	}
): Promise<number> {
	const terakhir = await db
		.prepare(`SELECT COALESCE(MAX(revisi), 0) AS n FROM revisions WHERE pernyataan_id = ?`)
		.bind(pernyataanId)
		.first<{ n: number }>();
	const berikut = (terakhir?.n ?? 0) + 1;

	await db
		.prepare(
			`INSERT INTO revisions
			 (pernyataan_id, revisi, aksi, isi, konteks, kategori, tanggal, sumber_url, status, catatan, oleh, oleh_hash)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			pernyataanId,
			berikut,
			data.aksi,
			data.isi,
			data.konteks,
			data.kategori,
			data.tanggal,
			data.sumber_url,
			data.status,
			data.catatan ?? null,
			data.oleh ?? null,
			data.olehHash ?? null
		)
		.run();

	// Simpan nomor revisi terakhir di entri supaya bisa ditampilkan tanpa join.
	await db
		.prepare(`UPDATE pernyataan SET jumlah_revisi = ? WHERE id = ?`)
		.bind(berikut, pernyataanId)
		.run();

	return berikut;
}

/** Daftar revisi terbaru dulu. */
export async function daftarRevisi(db: D1Database, pernyataanId: number) {
	const r = await db
		.prepare(
			`SELECT id, revisi, aksi, isi, konteks, kategori, tanggal, sumber_url, status, catatan, oleh, created_at
			 FROM revisions WHERE pernyataan_id = ? ORDER BY revisi DESC`
		)
		.bind(pernyataanId)
		.all<SnapshotRevisi>();
	return r.results ?? [];
}

export async function ambilRevisi(
	db: D1Database,
	pernyataanId: number,
	revisi: number
): Promise<SnapshotRevisi | null> {
	return await db
		.prepare(
			`SELECT id, revisi, aksi, isi, konteks, kategori, tanggal, sumber_url, status, catatan, oleh, created_at
			 FROM revisions WHERE pernyataan_id = ? AND revisi = ?`
		)
		.bind(pernyataanId, revisi)
		.first<SnapshotRevisi>();
}

// ---------------------------------------------------------------------------
// Diff tingkat kata/suku-kata untuk ditampilkan di halaman riwayat.
// ---------------------------------------------------------------------------
export type PotonganDiff = { t: string; jenis: 'sama' | 'tambah' | 'hapus' };

function token(teks: string): string[] {
	return teks.match(/\s+|[^\s]+/g) ?? [];
}

/** Diff sederhana berbasis LCS; cukup untuk kutipan satu-dua paragraf. */
export function diffKata(lama: string, baru: string): PotonganDiff[] {
	const a = token(lama);
	const b = token(baru);

	// Batas aman: LCS O(n*m) — kutipan panjang dipotong agar tidak membebani.
	const A = a.slice(0, 600);
	const B = b.slice(0, 600);

	const n = A.length;
	const m = B.length;
	const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
		}
	}

	const out: PotonganDiff[] = [];
	let i = 0;
	let j = 0;
	const dorong = (t: string, jenis: PotonganDiff['jenis']) => {
		const akhir = out[out.length - 1];
		if (akhir && akhir.jenis === jenis) akhir.t += t;
		else out.push({ t, jenis });
	};

	while (i < n && j < m) {
		if (A[i] === B[j]) {
			dorong(A[i], 'sama');
			i++;
			j++;
		} else if (dp[i + 1][j] >= dp[i][j + 1]) {
			dorong(A[i], 'hapus');
			i++;
		} else {
			dorong(B[j], 'tambah');
			j++;
		}
	}
	while (i < n) dorong(A[i++], 'hapus');
	while (j < m) dorong(B[j++], 'tambah');

	if (a.length > 600) out.push({ t: ' …', jenis: 'sama' });
	return out;
}
