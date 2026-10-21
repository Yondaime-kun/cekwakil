<script lang="ts">
	// Halaman ini menjawab pertanyaan yang paling sering muncul di luar situs:
	// "data ini dari mana, siapa yang isi, dan bagaimana saya ikut?".
	//
	// Struktur & gaya sengaja mengikuti /panduan persis: TOC kiri yang sticky,
	// isi article dengan h2 + paragraf, dan kartu sumber di akhir. Jangan
	// menambah pola tata letak baru di sini.
	import { REPO_URL, SITE_URL } from '#lib/site';

	const bagian = [
		{
			id: 'siapa',
			judul: 'Siapa yang mengisi',
			isi: [
				'CekWakil diisi oleh publik, bukan tim redaksi. Setiap entri berasal dari laporan orang lain yang menyertakan tautan sumbernya — dan siapa pun bisa mengoreksi, menyunting, atau melaporkan entri yang keliru.',
				'Tidak ada pendaftaran akun. Kontributor tidak perlu memberi nama, dan itu memang disengaja: yang dinilai di sini adalah sumbernya, bukan siapa yang mengirim.'
			]
		},
		{
			id: 'alur',
			judul: 'Dari laporan sampai tayang',
			isi: [
				'Pertama, kamu mengirim kutipan verbatim beserta tautan berita, tanggal, dan pejabatnya. Kutipan harus persis seperti yang tertulis di sumber — bukan parafrase, bukan ringkasan.',
				'Kedua, tautan sumber disimpan sebagai snapshot (Wayback) saat entri dibuat. Kalau artikelnya belakangan dihapus atau diedit, teks aslinya tetap bisa diperiksa.',
				'Ketiga, entri langsung tayang. Setiap suntingan membentuk revisi baru — tidak ada yang ditimpa dan hilang, dan riwayatnya terbuka untuk siapa pun.',
				'Keempat, entri yang belum diperiksa ditandai "belum diverifikasi". Siapa pun, tanpa akun, bisa membuka sumbernya lalu menandai terverifikasi. Entri yang tidak sesuai sumber dilaporkan dan ditarik dari publikasi.'
			]
		},
		{
			id: 'aturan',
			judul: 'Aturan yang dijaga',
			isi: [
				'Kutipan tidak pernah diedit. Isi kutipan wajib verbatim; markdown, penebalan, dan penyesuaian tata bahasa tidak diizinkan di bagian kutipan — hanya di kolom konteks dan bio.',
				'Wajib sumber yang bisa dibuka. Setiap entri tanpa tautan sumber ditolak, begitu juga tautan non-http(s), supaya tidak ada yang menyisipkan kode atau skrip.',
				'Konteks harus lengkap, bukan potongan yang menyesatkan. Kolom konteks ada supaya kalimat tidak dibaca di luar situasinya.',
				'Status hukum ditulis hati-hati. Tersangka bukan terpidana; peran dalam kasus dicatat apa adanya dan setiap kasus menyertakan tautan berita.'
			]
		},
		{
			id: 'bias',
			judul: 'Soal bias',
			isi: [
				'Kami tidak berpura-pura netral. Kontributor bukan sampel acak: yang datang ke sini cenderung orang yang sudah peduli politik, dan itu membuat pilihan "pernyataan mana yang dicatat" tidak pernah netral.',
				'Tidak ada aturan yang bisa sepenuhnya menghilangkan bias itu. Yang bisa dilakukan: setiap klaim punya sumber yang bisa diperiksa siapa pun, setiap perubahan tercatat, dan siapa pun boleh menambah maupun mengoreksi.',
				'Karena itu arsip ini bukan hasil penilaian akhir. Ia hanya berkas — cara membacanya ada di tanganmu, termasuk memeriksa sendiri sumbernya.'
			]
		},
		{
			id: 'mulai',
			judul: 'Mulai dari mana',
			isi: [
				'Lapor pernyataan: satu kutipan dengan satu tautan berita sudah berarti. Kalau ragu soal konteks, tulis apa adanya dan biarkan orang lain menambahkan.',
				'Lengkapi profil: partai, dapil, komisi, foto, dan bio. Halaman Lengkapi data mengurutkan profil yang paling bolong supaya kamu tidak perlu mencari.',
				'Verifikasi antrean: buka tautan sumber entri yang belum diverifikasi, lalu tandai kalau kutipannya memang cocok. Ini pekerjaan yang paling membantu dan paling cepat.',
				'Repositori kode terbuka di GitHub. Kalau menemukan bug atau ingin menambah fitur, buka issue di sana.'
			]
		},
		{
			id: 'mirror',
			judul: 'Kalau situs ini diblokir',
			isi: [
				'Risiko situs arsip di Indonesia bukan teori: akses bisa diputus tanpa pemberitahuan. Karena itu seluruh dataset bisa diunduh utuh dalam satu berkas JSON dan semua kode tersedia publik.',
				'Mirror tidak perlu menunggu izin. Situs ini satu Worker Cloudflare plus satu database D1; cukup fork repositori, buat database baru, terapkan migrasi, lalu impor dataset hasil unduhan.',
				'Lisensi kode MIT dan data CC BY-SA 4.0. Kalau kamu memirror, cukup cantumkan sumbernya.'
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
			{ rootMargin: '-90px 0px -70% 0px' }
		);
		els.forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	});
</script>

<svelte:head>
	<title>Cara kerja &amp; kontribusi - CekWakil</title>
	<meta
		name="description"
		content="Bagaimana CekWakil bekerja: siapa yang mengisi, bagaimana entri diverifikasi, soal bias, cara ikut berkontribusi, dan cara memirror data."
	/>
	<meta property="og:title" content="Cara kerja & kontribusi - CekWakil" />
	<meta
		property="og:description"
		content="Arsip terbuka: kutipan verbatim, sumber diarsipkan, revisi terlacak, verifikasi oleh siapa pun."
	/>
	<meta property="og:url" content={`${SITE_URL}/kontribusi`} />
</svelte:head>

<section class="container section">
	<h1>Cara kerja &amp; kontribusi</h1>
	<p class="small muted intro">
		Arsip ini diisi publik dan dibaca publik. Ini penjelasan singkat tentang dari mana datanya datang,
		apa yang dijaga, dan bagian mana yang bisa kamu kerjakan.
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
			{#each bagian as b (b.id)}
				<article id={b.id}>
					<h2>{b.judul}</h2>
					{#each b.isi as p (p)}
						<p>{p}</p>
					{/each}

					{#if b.id === 'alur'}
						<div class="tombol-row">
							<a class="btn btn-sm" href="/submit">Lapor pernyataan</a>
							<a class="btn btn-secondary btn-sm" href="/tinjau">Buka antrean verifikasi</a>
						</div>
					{:else if b.id === 'mulai'}
						<div class="tombol-row">
							<a class="btn btn-secondary btn-sm" href="/lengkapi">Lengkapi data</a>
							<a class="btn btn-secondary btn-sm" href="/blunder">Buka arsip</a>
						</div>
					{:else if b.id === 'mirror'}
						<div class="tombol-row">
							<a class="btn btn-sm" href="/api/export?dataset=penuh">Unduh seluruh dataset</a>
							<a class="btn btn-secondary btn-sm" href="/api/export?format=csv">Kutipan (CSV)</a>
						</div>
					{/if}
				</article>
			{/each}

			<article id="sumber" class="sumbercat">
				<h2>Sumber &amp; repositori</h2>
				<ul>
					<li>
						<a href={REPO_URL} target="_blank" rel="noopener noreferrer">Repositori kode (GitHub)</a>
						<span>kode MIT, skema migrasi, dan templat issue.</span>
					</li>
					<li>
						<a href="/api/export?dataset=penuh">Unduhan dataset lengkap</a>
						<span>pejabat, kutipan, tag, kasus, LHKPN, rekam jejak — satu berkas JSON.</span>
					</li>
					<li>
						<a href={SITE_URL} target="_blank" rel="noopener noreferrer">cekwakil.bond</a>
						<span>situs utama, tanpa iklan dan tanpa pelacakan.</span>
					</li>
					<li>
						<a href="/panduan">Panduan sistem DPR</a>
						<span>konteks kelembagaan untuk membaca arsip ini dengan tepat.</span>
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
	.tombol-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 4px;
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
