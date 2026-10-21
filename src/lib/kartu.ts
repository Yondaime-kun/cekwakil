// Gambar kartu kutipan/profil untuk dibagikan, digambar di browser.
//
// Kenapa di klien: Worker tidak punya canvas native, jadi render PNG di server
// butuh layanan tambahan. Browser pengunjung sudah punya canvas, font, dan
// data yang sama — cukup satu tombol untuk menghasilkan file 1200x630 PNG yang
// diterima WhatsApp/Instagram/Facebook (yang menolak SVG).

import { pasangFontKartu } from './fontkartu';

const W = 1200;
const H = 630;

const WARNA = {
	terang: {
		latar: '#fbfbfa',
		teks: '#1c1c1a',
		teks2: '#5c5c58',
		teks3: '#7d7d79',
		garis: '#e0e0de',
		aksen: '#1f5f4e',
		aksenLatar: '#eaf2ef',
		aksenGaris: '#b9d3ca'
	},
	gelap: {
		latar: '#16171a',
		teks: '#f0f1f3',
		teks2: '#a7abb2',
		teks3: '#8b8f97',
		garis: '#303338',
		aksen: '#7cc6ab',
		aksenLatar: '#17322a',
		aksenGaris: '#2f5a4b'
	}
};

type Palet = (typeof WARNA)['terang'];

export type DataKutipan = {
	jenis: 'kutipan';
	isi: string;
	kategori: string;
	tanggal: string;
	nama: string;
	jabatan: string;
};

export type DataProfil = {
	jenis: 'profil';
	nama: string;
	jabatan: string;
	meta: string;
	jumlahKutipan: number;
	jumlahKasus: number;
	foto: string | null;
};

export type DataKartu = DataKutipan | DataProfil;

/** Font siap pakai: font situs sudah dimuat halaman, jadi tinggal dipakai. */
async function siapkanFont(): Promise<void> {
	const daftar = [
		'400 58px "Archivo Black"',
		'400 46px "Archivo Black"',
		'400 40px "Archivo Black"',
		'400 34px "Archivo Black"',
		'400 28px "Archivo Black"',
		'400 22px "Space Mono"',
		'400 20px "Space Mono"',
		'400 19px "Space Mono"',
		'500 15px "Inter Tight Variable"'
	];
	await Promise.all(daftar.map((f) => document.fonts.load(f).catch(() => [])));
	await document.fonts.ready;
}

/** Potong teks jadi baris yang muat di lebar tertentu. */
function bungkus(
	ctx: CanvasRenderingContext2D,
	teks: string,
	lebar: number,
	maksBaris: number
): string[] {
	const kata = teks.split(/\s+/).filter(Boolean);
	const baris: string[] = [];
	let kini = '';
	for (const k of kata) {
		const coba = kini ? `${kini} ${k}` : k;
		if (ctx.measureText(coba).width > lebar && kini) {
			baris.push(kini);
			kini = k;
			if (baris.length === maksBaris) break;
		} else {
			kini = coba;
		}
	}
	if (baris.length < maksBaris && kini) baris.push(kini);
	if (baris.length === maksBaris && baris.join(' ').length < teks.length - 2) {
		let akhir = baris[maksBaris - 1];
		while (akhir.length > 1 && ctx.measureText(`${akhir}…`).width > lebar) {
			akhir = akhir.slice(0, -1);
		}
		baris[maksBaris - 1] = `${akhir.replace(/\s+$/, '')}…`;
	}
	return baris;
}

function garis(ctx: CanvasRenderingContext2D, p: Palet, y: number) {
	ctx.strokeStyle = p.garis;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(72, y);
	ctx.lineTo(W - 72, y);
	ctx.stroke();
}

function kepala(ctx: CanvasRenderingContext2D, p: Palet, kanan: string) {
	ctx.fillStyle = p.teks2;
	ctx.font = '400 22px "Space Mono", monospace';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	ctx.letterSpacing = '3px';
	ctx.fillText('CEK WAKIL', 72, 92);

	ctx.fillStyle = p.teks3;
	ctx.font = '400 20px "Space Mono", monospace';
	ctx.textAlign = 'right';
	ctx.letterSpacing = '1px';
	ctx.fillText(kanan.toUpperCase(), W - 72, 92);
	ctx.letterSpacing = '0px';
	ctx.textAlign = 'left';
}

function kaki(ctx: CanvasRenderingContext2D, p: Palet, kiri: string[], kanan = 'cekwakil.bond') {
	garis(ctx, p, H - 84);
	ctx.fillStyle = p.teks2;
	ctx.font = '400 19px "Space Mono", monospace';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(kiri[0] ?? '', 72, H - 42);
	if (kiri[1]) {
		ctx.fillStyle = p.teks3;
		ctx.font = '400 17px "Space Mono", monospace';
		ctx.fillText(kiri[1], 72, H - 18);
	}
	ctx.fillStyle = p.aksen;
	ctx.font = '400 19px "Space Mono", monospace';
	ctx.textAlign = 'right';
	ctx.fillText(kanan, W - 72, H - 42);
	ctx.textAlign = 'left';
}

async function muatGambar(src: string): Promise<HTMLImageElement | null> {
	return await new Promise((res) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => res(img);
		img.onerror = () => res(null);
		img.src = src;
		setTimeout(() => res(null), 6000);
	});
}

/** Gambar satu kartu ke canvas 1200x630 dan kembalikan blob PNG. */
export async function gambarKartu(data: DataKartu, gelap = false): Promise<Blob> {
	// Font situs belum tentu dimuat (halaman tidak memakainya), jadi daftarkan
	// dulu sebelum canvas menggambar teks.
	pasangFontKartu();
	await siapkanFont();
	const p = gelap ? WARNA.gelap : WARNA.terang;

	const canvas = document.createElement('canvas');
	// Skala 2x supaya teks tetap tajam saat dibuka di layar retina.
	const S = 2;
	canvas.width = W * S;
	canvas.height = H * S;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas tidak tersedia');
	ctx.scale(S, S);

	ctx.fillStyle = p.latar;
	ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = p.aksen;
	ctx.fillRect(0, 0, 10, H);

	if (data.jenis === 'kutipan') {
		const tanggal = new Date(data.tanggal).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		kepala(ctx, p, tanggal);
		garis(ctx, p, 118);

		ctx.fillStyle = p.aksen;
		ctx.font = '400 20px "Space Mono", monospace';
		ctx.letterSpacing = '2px';
		ctx.fillText(data.kategori.toUpperCase().slice(0, 46), 72, 168);
		ctx.letterSpacing = '0px';

		// Pilih ukuran font terbesar yang membuat seluruh kutipan muat.
		const areaAtas = 236;
		const areaBawah = H - 132 - 26;
		const ukuran = [58, 52, 46, 40, 36, 32, 28, 25, 22, 20];
		let baris: string[] = [];
		let font = ukuran[ukuran.length - 1];
		let tinggi = 30;
		for (const u of ukuran) {
			font = u;
			tinggi = Math.round(u * 1.42);
			ctx.font = `400 ${u}px "Archivo Black", "Arial Black", sans-serif`;
			const maks = Math.max(2, Math.floor((areaBawah - areaAtas) / tinggi));
			baris = bungkus(ctx, data.isi, W - 160, maks);
			if (baris.join(' ').replace(/…$/, '').length >= data.isi.length - 2) break;
		}

		ctx.font = `400 ${font}px "Archivo Black", "Arial Black", sans-serif`;
		ctx.fillStyle = p.teks;
		ctx.textBaseline = 'alphabetic';
		let y = areaAtas;
		for (const b of baris) {
			ctx.fillText(b, 72, y);
			y += tinggi;
		}

		kaki(ctx, p, [data.nama.slice(0, 40), data.jabatan.slice(0, 54)]);
	} else {
		kepala(ctx, p, 'Profil pejabat');
		garis(ctx, p, 118);

		// Avatar: foto kalau bisa dimuat lintas-origin, kalau tidak inisial.
		const cx = 1032;
		const cy = 284;
		const r = 88;
		ctx.save();
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.clip();
		let adaFoto = false;
		if (data.foto) {
			const img = await muatGambar(data.foto);
			if (img) {
				const sisi = Math.min(img.width, img.height);
				ctx.drawImage(
					img,
					(img.width - sisi) / 2,
					(img.height - sisi) / 2,
					sisi,
					sisi,
					cx - r,
					cy - r,
					r * 2,
					r * 2
				);
				adaFoto = true;
			}
		}
		if (!adaFoto) {
			ctx.fillStyle = p.aksenLatar;
			ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
			const inisial = data.nama
				.replace(/[^A-Za-z\s]/g, '')
				.trim()
				.split(/\s+/)
				.filter(Boolean)
				.slice(0, 2)
				.map((w) => w[0]?.toUpperCase())
				.join('');
			ctx.fillStyle = p.aksen;
			ctx.font = '400 58px "Archivo Black", sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(inisial, cx, cy + 2);
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
		}
		ctx.restore();
		ctx.strokeStyle = p.aksenGaris;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.stroke();

		const fontNama = data.nama.length > 26 ? 46 : 62;
		ctx.fillStyle = p.teks;
		ctx.font = `400 ${fontNama}px "Archivo Black", "Arial Black", sans-serif`;
		ctx.fillText(data.nama.slice(0, 34), 72, 236);

		ctx.fillStyle = p.teks2;
		ctx.font = '400 21px "Space Mono", monospace';
		ctx.fillText(data.meta.slice(0, 62), 72, 300);

		garis(ctx, p, 404);

		const angka = [
			{ n: data.jumlahKutipan, l: 'KUTIPAN TERARSIP', x: 72, warna: p.aksen },
			{ n: data.jumlahKasus, l: 'KASUS TERCATAT', x: 392, warna: p.teks }
		];
		for (const a of angka) {
			ctx.fillStyle = a.warna;
			ctx.font = '400 60px "Archivo Black", sans-serif';
			ctx.fillText(String(a.n), a.x, 466);
			ctx.fillStyle = p.teks2;
			ctx.font = '400 18px "Space Mono", monospace';
			ctx.fillText(a.l, a.x, 500);
		}

		kaki(ctx, p, ['Arsip pernyataan pejabat publik']);
	}

	return await new Promise<Blob>((res, rej) => {
		canvas.toBlob(
			(b) => (b ? res(b) : rej(new Error('Gagal membuat PNG'))),
			'image/png',
			0.95
		);
	});
}

/** Nama file yang aman untuk diunduh. */
export function namaFile(data: DataKartu): string {
	const dasar =
		data.jenis === 'kutipan'
			? `kutipan-${data.nama}-${data.tanggal}`
			: `profil-${data.nama}`;
	return (
		`cekwakil-${dasar}`
			.normalize('NFKD')
			.replace(/[^\w\s-]/g, '')
			.trim()
			.replace(/\s+/g, '-')
			.toLowerCase()
			.slice(0, 70) + '.png'
	);
}

/** Salin blob ke clipboard sebagai image/png (browser lama bisa menolak). */
export async function salinGambarKeClipboard(blob: Blob): Promise<void> {
	await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

