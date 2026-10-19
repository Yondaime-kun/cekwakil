// Normalisasi nama pejabat untuk deteksi duplikat.
// "H. M. Yahya Zaini, S.H., M.Si." -> "yahya zaini"
//
// Strategi: potong deretan gelar di depan dan belakang nama. Gelar bisa
// berantai dengan koma/titik ("Prof. Dr. H. Bambang, S.E., M.B.A.") jadi
// setelah tanda baca dibuang, sisanya berupa deretan token gelar di kedua
// ujung. Token nama inti di tengah tidak disentuh.

// Gelar satuan dan potongan gelar berantai (sisa huruf setelah koma/titik).
const GELAR = new Set([
	// gelar depan
	'h',
	'hj',
	'hajj',
	'dr',
	'drs',
	'ir',
	'prof',
	// gelar belakang utuh
	'sh',
	'mh',
	'se',
	'mm',
	'ssos',
	'msi',
	'sip',
	'ma',
	'ba',
	'st',
	'mt',
	'skom',
	'spd',
	'mpd',
	'sd',
	'phd',
	'mba',
	'msc',
	'llm',
	// potongan berantai: S.H. → s lalu h; M.Si. → m lalu si; M.B.A. → m, b, a
	's',
	'm',
	'b',
	'a',
	'si',
	'e'
]);

export function normalisasiNama(nama: string): string {
	const tokens = nama
		.toLowerCase()
		.replace(/[^a-z\s]/g, ' ')
		.split(/\s+/)
		.filter(Boolean);

	// lepas gelar dari depan
	let start = 0;
	while (start < tokens.length && GELAR.has(tokens[start])) start++;
	// lepas gelar dari belakang (sisakan minimal satu token sebagai nama)
	let end = tokens.length;
	while (end > start + 1 && GELAR.has(tokens[end - 1])) end--;

	return tokens.slice(start, end).join(' ');
}
