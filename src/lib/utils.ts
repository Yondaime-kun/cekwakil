export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function fmtDate(iso: string): string {
	// '2025-03-14' or ISO datetime -> '14 Mar 2025'
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateLong(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** 'Baru saja', '3 jam lalu', '2 hari lalu' — lalu jatuh ke tanggal. */
export function fmtRelative(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	const diff = (Date.now() - d.getTime()) / 1000;
	if (diff < 60) return 'baru saja';
	if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
	if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
	if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
	return fmtDate(iso);
}

export function fmtRp(n: number): string {
	if (n >= 1_000_000_000_000) return `Rp ${(n / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
	if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
	if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} jt`;
	return `Rp ${n.toLocaleString('id-ID')}`;
}

/** Ambil domain dari URL untuk label sumber ("kompas.com"). */
export function hostname(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return 'sumber';
	}
}

/**
 * Bangun ulang query string dengan perubahan, tanpa menyisakan nilai kosong
 * atau `page` yang basi. Dipakai filter yang harus tetap ada saat di-navigasi.
 */
export function withParams(
	// SvelteKit 3 memberi ReadonlyURLSearchParams, jadi cukup apa pun yang
	// bisa dibaca sebagai iterable pasangan kunci-nilai.
	current: URLSearchParams | { forEach(cb: (v: string, k: string) => void): void },
	changes: Record<string, string | number | null | undefined>
): string {
	const next = new URLSearchParams();
	current.forEach((v, k) => next.set(k, v));
	for (const [k, v] of Object.entries(changes)) {
		if (v === null || v === undefined || v === '' ) next.delete(k);
		else next.set(k, String(v));
	}
	// Filter berubah -> mulai dari halaman 1, kecuali page ikut diubah.
	if (!('page' in changes)) next.delete('page');
	const s = next.toString();
	return s ? `?${s}` : '';
}

/** Pisahkan kutipan jadi potongan match/non-match untuk highlight. */
export function splitHighlight(text: string, q: string): Array<{ t: string; hit: boolean }> {
	const needle = q.trim();
	if (needle.length < 2) return [{ t: text, hit: false }];
	const lowered = text.toLowerCase();
	const lneedle = needle.toLowerCase();
	const out: Array<{ t: string; hit: boolean }> = [];
	let i = 0;
	let from = 0;
	while ((i = lowered.indexOf(lneedle, from)) !== -1) {
		if (i > from) out.push({ t: text.slice(from, i), hit: false });
		out.push({ t: text.slice(i, i + needle.length), hit: true });
		from = i + needle.length;
	}
	if (from < text.length) out.push({ t: text.slice(from), hit: false });
	return out;
}

export function validateSubmission(body: Record<string, unknown>): string[] {
	const errs: string[] = [];
	const isi = String(body.isi ?? '').trim();
	const url = String(body.sumber_url ?? '').trim();
	const kategori = String(body.kategori ?? '').trim();
	const tanggal = String(body.tanggal ?? '').trim();
	const pejabatId = body.pejabat_id;
	const namaBaru = String(body.nama_pejabat_baru ?? '').trim();

	if (isi.length < 20) errs.push('Kutipan pernyataan minimal 20 karakter.');
	if (isi.length > 2000) errs.push('Kutipan maksimal 2000 karakter.');
	try {
		const u = new URL(url);
		if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
	} catch {
		errs.push('Link sumber berita tidak valid (harus http/https).');
	}
	if (!kategori) errs.push('Pilih kategori.');
	if (!/^\d{4}-\d{2}-\d{2}/.test(tanggal)) errs.push('Tanggal tidak valid.');
	if (!pejabatId && namaBaru.length < 3) errs.push('Isi nama pejabat (min. 3 karakter) atau pilih dari daftar.');
	if (String(body.konteks ?? '').trim().length < 10) errs.push('Konteks minimal 10 karakter: jelaskan singkat kenapa pernyataan ini bermasalah.');
	return errs;
}
