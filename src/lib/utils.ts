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

export function fmtRp(n: number): string {
	if (n >= 1_000_000_000_000) return `Rp ${(n / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
	if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
	if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} jt`;
	return `Rp ${n.toLocaleString('id-ID')}`;
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
