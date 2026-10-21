<script lang="ts">
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

	// Scroll-spy: aktif = bagian terakhir yang judulnya sudah lewat atas viewport.
	let aktif = $state(bagian[0].id);

	$effect(() => {
		const els = bagian
			.map((b) => document.getElementById(b.id))
			.filter((el): el is HTMLElement => el !== null);

		const obs = new IntersectionObserver(
			(entries) => {
				const terlihat = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (terlihat[0]) aktif = terlihat[0].target.id;
			},
			// Garis aktif sedikit di bawah header sticky.
			{ rootMargin: '-90px 0px -70% 0px' }
		);
		els.forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	});
</script>

<svelte:head>
	<title>Panduan sistem DPR - CekWakil</title>
	<meta
		name="description"
		content="Penjelasan singkat cara kerja DPR: fungsi, dapil, komisi, fraksi, hak angket, PAW, LHKPN, dan cara ikut menjaga arsip."
	/>
</svelte:head>

<section class="container section">
	<h1>Panduan sistem DPR</h1>
	<p class="small muted intro">
		Arsip ini hanya berguna kalau pembacanya tahu konteks kelembagaannya. Ini ringkasan singkat untuk
		membacanya dengan tepat — ditulis netral, tanpa tendensi politik.
	</p>

	<div class="layout">
		<nav class="toc" aria-label="Daftar bagian">
			{#each bagian as b, i (b.id)}
				<a href={`#${b.id}`} class:active={aktif === b.id}>
					<span class="n num">{String(i + 1).padStart(2, '0')}</span>{b.judul}
				</a>
			{/each}
		</nav>

		<div class="isi">
			{#each bagian as b, i (b.id)}
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
					<li>
						<a href="https://www.dpr.go.id" target="_blank" rel="noopener noreferrer">Situs resmi DPR RI</a>
						<span>struktur komisi, jadwal rapat, berita.</span>
					</li>
					<li>
						<a href="https://elhkpn.kpk.go.id" target="_blank" rel="noopener noreferrer">e-LHKPN KPK</a>
						<span>laporan harta penyelenggara negara.</span>
					</li>
					<li>
						<a href="https://peraturan.bpk.go.id" target="_blank" rel="noopener noreferrer">JDIH BPK</a>
						<span>teks UU 17/2014 tentang MPR, DPR, DPD, DPRD.</span>
					</li>
					<li>
						<a href="https://kpu.go.id" target="_blank" rel="noopener noreferrer">KPU</a>
						<span>data pemilu dan perolehan suara resmi.</span>
					</li>
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
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 40px;
		align-items: start;
	}
	.toc {
		position: sticky;
		top: calc(var(--header-h) + 20px);
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--line);
	}
	.toc a {
		display: flex;
		gap: 8px;
		padding: 7px 0 7px 12px;
		margin-left: -1px;
		font-size: 13.5px;
		line-height: 1.4;
		color: var(--text-2);
		text-decoration: none;
		border-left: 2px solid transparent;
	}
	.toc a:hover {
		color: var(--text);
	}
	.toc a.active {
		color: var(--text);
		font-weight: 620;
		border-left-color: var(--accent);
	}
	.n {
		font-size: 11px;
		color: var(--text-3);
		padding-top: 2px;
	}
	article {
		margin-bottom: 36px;
		scroll-margin-top: calc(var(--header-h) + 16px);
	}
	article h2 {
		font-size: 21px;
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
		gap: 8px;
		max-width: 68ch;
	}
	.sumbercat li {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 11px 14px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		font-size: 14px;
	}
	.sumbercat li span {
		color: var(--text-2);
		font-size: 13px;
	}
	@media (max-width: 860px) {
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
			padding-bottom: 12px;
			border-bottom: 1px solid var(--line);
		}
		.toc a {
			border: 1px solid var(--line);
			border-radius: var(--radius-pill);
			padding: 5px 11px;
			margin: 0;
			font-size: 12.5px;
			background: var(--surface);
			align-items: center;
		}
		.toc a.active {
			background: var(--accent-soft);
			border-color: var(--accent-line);
		}
		.n {
			padding-top: 0;
		}
		article {
			scroll-margin-top: 12px;
		}
	}
</style>
