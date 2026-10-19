<script lang="ts">
	import { page } from '$app/state';

	// Ensiklopedia singkat: bagaimana DPR bekerja dan kenapa arsip ini penting.
	const bagian = [
		{
			id: 'mandat',
			judul: 'Tiga fungsi DPR',
			isi: [
				'DPR punya tiga fungsi yang diatur dalam UU 17/2014 (UU MD3): legislasi (membuat undang-undang), anggaran (menyetujui APBN), dan pengawasan (mengawasi jalannya pemerintahan). Ketiganya dieksekusi lewat alat kelengkapan: badan legislasi, badan anggaran, komisi-komisi, dan badan kehormatan.',
				'Fungsi pengawasan dijalankan lewat rapat kerja dengan kementerian/lembaga, rapat dengar pendapat (RDP) dengan ahli, dan rapat dengar pendapat umum (RDPU) dengan masyarakat. Pernyataan yang masuk arsip ini biasanya keluar dari forum-forum itu, konferensi pers di gedung DPR, atau wawancara media.'
			]
		},
		{
			id: 'dapil',
			judul: 'Dapil, suara, dan kursi',
			isi: [
				'Anggota DPR dipilih lewat daerah pemilihan (dapil) dengan sistem proporsional terbuka: pemilih mencoblos nama calon, bukan hanya partai. Perolehan suara pribadi menentukan siapa yang duduk.',
				'Jumlah kursi per dapil berkisar 3–10 sesuai jumlah penduduk. Untuk DPR RI 2024–2029 (580 kursi), suara sah di tiap dapil menentukan alokasi kursi antar partai (metode Webster/Sainte-Laguë), lalu kursi partai diisi calon dengan suara terbanyak.',
				'Konsekuensi praktisnya: anggota yang nyaris tidak masuk parlemen bisa lolos karena suara personal. Itu sebabnya arsip ini mencatat perolehan suara — untuk melihat siapa yang populer dan siapa yang duduk karena sisa suara partai.'
			]
		},
		{
			id: 'komisi',
			judul: 'Komisi dan mitra kerja',
			isi: [
				'DPR membagi bidang kerja ke dalam 13 komisi. Setiap komisi punya daftar kementerian/lembaga mitra — misalnya Komisi IX membidangi kesehatan dan ketenagakerjaan (mitra: Kemenkes, Kemenaker, BPJS), Komisi X membidangi pendidikan, pemuda, olahraga, dan pariwisata.',
				'Kalau ingin menilai kinerja seorang anggota, komisi menentukan isu apa yang seharusnya dia kuasai dan rapat apa yang seharusnya dia hadiri. Anggota yang jarang muncul di rapat komisinya sulit dibilang menjalankan fungsi pengawasan.'
			]
		},
		{
			id: 'fraksi',
			judul: 'Fraksi vs partai',
			isi: [
				'Fraksi adalah kelompok anggota di DPR berdasarkan partai. Partai dengan kursi di bawah ambang bisa menggabungkan anggotanya jadi satu fraksi gabungan.',
				'Sikap resmi fraksi sering berbeda dari sikap pribadi anggotanya. Saat membaca arsip ini, bedakan dua hal: pernyataan atas nama pribadi (wawancara, media sosial) dan pernyataan atas nama fraksi (konferensi pers, pidato di ruang sidang). Yang kedua mengikat lebih banyak orang — tetapi tetap ada nama yang menyampaikannya.'
			]
		},
		{
			id: 'hak',
			judul: 'Hak angket, interpelasi, menyatakan pendapat',
			isi: [
				'Hak angket: DPR menyelidiki kebijakan pemerintah yang diduga penting, strategis, dan berdampak luas pada kehidupan banyak orang. Hasilnya berupa rekomendasi ke pemerintah dan bisa berlanjut ke jalur hukum.',
				'Hak interpelasi: DPR meminta penjelasan pemerintah atas kebijakan tertentu yang penting dan strategis. Hak menyatakan pendapat: sikap resmi DPR atas kebijakan pemerintah atau peristiwa luar biasa. Ketiganya butuh dukungan suara besar — biasanya mayoritas fraksi — sehingga jarang dipakai.'
			]
		},
		{
			id: 'paw',
			judul: 'Pengganti antar waktu (PAW)',
			isi: [
				'Kursi anggota bisa berganti di tengah masa jabatan: berhenti, meninggal, dicabut keanggotaannya, atau terpilih jadi kepala daerah/menteri. Penggantinya adalah calon urutan berikutnya di dapil yang sama dari partai yang sama.',
				'Arsip profil yang berganti orang itu penting: pejabat yang diganti tetap punya rekam jejak masa jabatannya, dan penggantinya mulai ditinjau dari nol.'
			]
		},
		{
			id: 'lhkpn',
			judul: 'LHKPN dan harta kekayaan',
			isi: [
				'Setiap penyelenggara negara wajib melaporkan harta kekayaannya secara berkala lewat LHKPN (elhkpn.kpk.go.id). Laporan berisi total harta (kas, properti, kendaraan, surat berharga) dan utang.',
				'Perbandingan antar tahun yang paling informatif: lonjakan harta yang tidak wajar sepanjang masa jabatan patut ditanyakan. Entri harta di situs ini diisi publik dan wajib menyertakan tautan dokumen aslinya.'
			]
		},
		{
			id: 'cek',
			judul: 'Cara membaca dan ikut menjaga arsip ini',
			isi: [
				'Setiap entri adalah kutipan, bukan opini. Yang dinilai bukan "bagus atau buruk", tapi: apakah kalimatnya benar-benar diucapkan, dan apakah konteksnya lengkap.',
				'Setiap entri punya tautan sumber — dan setiap sumber diarsipkan otomatis supaya tetap bisa dibuka walau artikel aslinya dihapus.',
				'Kalau kamu menemukan entri yang kutipannya tidak sesuai sumber, klik "Laporkan" pada entri itu. Entri akan ditarik dari publikasi dan alasannya dicatat. Kalau pencabutan itu keliru, entri bisa dipulihkan kembali.'
			]
		}
	];

	const aktif = $derived(page.url.hash.replace('#', '') || bagian[0].id);
</script>

<svelte:head>
	<title>Panduan sistem DPR - CekWakil</title>
	<meta
		name="description"
		content="Penjelasan singkat cara kerja DPR: fungsi, dapil, komisi, fraksi, hak angket, PAW, LHKPN, dan cara ikut menjaga arsip." />
</svelte:head>

<section class="container section">
	<h1>Panduan sistem DPR</h1>
	<p class="small muted intro">
		Arsip ini hanya berguna kalau pembacanya tahu konteks kelembagaannya. Ini ringkasan singkat
		untuk membacanya dengan tepat — ditulis netral, tanpa tendensi politik.
	</p>

	<div class="layout">
		<nav class="toc" aria-label="Daftar bagian">
			{#each bagian as b (b.id)}
				<a href={`#${b.id}`} class:active={aktif === b.id}>{b.judul}</a>
			{/each}
		</nav>

		<div class="isi">
			{#each bagian as b (b.id)}
				<article id={b.id}>
					<h2>{b.judul}</h2>
					{#each b.isi as p (p)}
						<p>{p}</p>
					{/each}
				</article>
			{/each}

			<article class="sumbercat">
				<h2>Sumber rujukan</h2>
				<ul>
					<li><a href="https://www.dpr.go.id" target="_blank" rel="noopener noreferrer">Situs resmi DPR RI</a> — struktur komisi, jadwal rapat, berita.</li>
					<li><a href="https://elhkpn.kpk.go.id" target="_blank" rel="noopener noreferrer">e-LHKPN KPK</a> — laporan harta penyelenggara negara.</li>
					<li><a href="https://peraturan.bpk.go.id" target="_blank" rel="noopener noreferrer">JDIH BPK</a> — teks UU 17/2014 tentang MPR, DPR, DPD, DPRD.</li>
					<li><a href="https://kpu.go.id" target="_blank" rel="noopener noreferrer">KPU</a> — data pemilu dan perolehan suara resmi.</li>
				</ul>
			</article>
		</div>
	</div>
</section>

<style>
	.intro {
		margin: 8px 0 22px;
		max-width: 62ch;
	}
	.layout {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 36px;
		align-items: start;
	}
	.toc {
		position: sticky;
		top: 78px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-left: 1px solid var(--line);
	}
	.toc a {
		padding: 6px 0 6px 12px;
		font-size: 13.5px;
		color: var(--muted);
		text-decoration: none;
		border-left: 2px solid transparent;
		margin-left: -1px;
	}
	.toc a:hover {
		color: var(--text);
	}
	.toc a.active {
		color: var(--text);
		font-weight: 600;
		border-left-color: var(--accent);
	}
	article {
		margin-bottom: 34px;
		scroll-margin-top: 78px;
	}
	article h2 {
		font-size: 20px;
		margin-bottom: 10px;
	}
	article p {
		margin-bottom: 12px;
		max-width: 68ch;
		color: var(--text-2);
	}
	.sumbercat ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 68ch;
	}
	.sumbercat li {
		padding: 11px 14px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		font-size: 14.5px;
		color: var(--text-2);
	}
	@media (max-width: 760px) {
		.layout {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.toc {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 6px;
			border-left: none;
		}
		.toc a {
			border: 1px solid var(--line);
			border-radius: 999px;
			padding: 5px 11px;
			margin: 0;
			font-size: 12.5px;
		}
		.toc a.active {
			background: var(--n-100);
			border-color: var(--line-strong);
			border-left-color: var(--line-strong);
		}
		article {
			scroll-margin-top: 12px;
		}
	}
</style>
