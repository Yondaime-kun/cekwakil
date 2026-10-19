// Database schema types and helpers for CekWakil

export type Fraksi = string;

export interface Pejabat {
	id: number;
	nama: string;
	jabatan: string; // 'Anggota DPR RI' | 'Menteri' | dll
	instansi: string; // 'DPR RI' | 'Kabinet Merah Putih' | ...
	partai: string | null;
	dapil: string | null;
	komisi: string | null;
	foto_url: string | null;
	wikipedia_url: string | null;
}

export interface Pernyataan {
	id: number;
	pejabat_id: number;
	isi: string; // kutipan pernyataan
	konteks: string; // penjelasan singkat kenapa jadi masalah
	kategori: string; // 'hoaks' | 'sexist' | 'rasial' | 'fantasi' | 'anti-kritis' | 'lainnya'
	sumber_url: string; // link berita
	tanggal: string; // ISO date
	created_at: string;
	status: 'published' | 'pending' | 'rejected';
}

export interface Submission {
	id: number;
	pejabat_id: number | null;
	nama_pejabat_baru: string | null;
	isi: string;
	konteks: string;
	kategori: string;
	sumber_url: string;
	tanggal: string;
	submitter: string | null; // nama opsional submitter
	created_at: string;
	status: 'pending' | 'approved' | 'rejected';
	review_note: string | null;
}

export const KATEGORI = [
	'hoaks / misinformasi',
	'sexist / merendahkan perempuan',
	'rasial / SARA',
	'fantasi / keluar nalar',
	'anti-kritis / anti-demo',
	'kabur dari tanggung jawab',
	'lainnya'
] as const;
