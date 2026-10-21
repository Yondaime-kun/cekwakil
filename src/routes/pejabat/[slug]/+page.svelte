<script lang="ts">
	import { fmtRp } from '#lib/utils';
	import EntryCard from '#lib/components/EntryCard.svelte';
	import ShareButton from '#lib/components/ShareButton.svelte';
	import PejabatAvatar from '#lib/components/PejabatAvatar.svelte';
	import { hitungButir, skorKelengkapan, labelSkor } from '#lib/kelengkapan';
	import { SITE_URL } from '#lib/site';

	let { data } = $props();
	const person = $derived(data.person as Record<string, unknown>);
	const pernyataan = $derived(data.pernyataan as Array<Record<string, unknown>>);
	const kasus = $derived(data.kasus as Array<Record<string, unknown>>);
	const harta = $derived((data.harta as Array<Record<string, unknown>>) ?? []);
	const rekam = $derived((data.rekam as Array<Record<string, unknown>>) ?? []);

	const totalNominal = $derived(kasus.reduce((acc, k) => acc + (Number(k.nominal_rp) || 0), 0));

	// Kolom grafik LHKPN: urut tahun naik supaya batang tumbuh ke kanan.
	const hartaNaik = $derived([...harta].sort((a, b) => Number(a.tahun) - Number(b.tahun)));
	const maxHarta = $derived(Math.max(1, ...hartaNaik.map((h) => Number(h.total_harta) || 0)));
	const hartaTerakhir = $derived(hartaNaik.length ? hartaNaik[hartaNaik.length - 1] : null);

	function delta(i: number): number | null {
		if (i === 0) return null;
		const prev = Number(hartaNaik[i - 1].total_harta) || 0;
		const cur = Number(hartaNaik[i].total_harta) || 0;
		if (!prev || !cur) return null;
		return cur - prev;
	}

	// Bagian yang benar-benar ada isinya, dinomori berurutan untuk rail.
	const bagian = $derived(
		[
			// Kasus & harta selalu tampil (walau nol): komunitas minta arsip yang
			// terlihat jujur soal apa yang BELUM tercatat, bukan yang menghilangkannya.
			{ id: 'kasus', label: 'Kasus korupsi', ada: true, n: kasus.length },
			{ id: 'harta', label: 'Riwayat LHKPN', ada: true, n: harta.length },
			{ id: 'rekam', label: 'Rekam jejak', ada: rekam.length > 0, n: rekam.length },
			{ id: 'pernyataan', label: 'Kutipan terarsip', ada: pernyataan.length > 0, n: pernyataan.length }
		]
			.filter((b) => b.ada)
			.map((b, i) => ({ ...b, no: String(i + 1).padStart(2, '0') }))
	);

	const butirProfil = $derived(
		hitungButir(
			{
				partai: person.partai as string | null,
				dapil: person.dapil as string | null,
				komisi: person.komisi as string | null,
				suara: person.suara as number | null,
				foto_url: person.foto_url as string | null,
				wikipedia_url: person.wikipedia_url as string | null,
				bio: person.bio as string | null,
				sumber_bio: person.sumber_bio as string | null,
				jumlah_kutipan: pernyataan.length
			},
			String(person.slug)
		)
	);
	const skor = $derived(skorKelengkapan(butirProfil));
	const status = $derived(labelSkor(skor));
	const belum = $derived(butirProfil.filter((b) => !b.ada));
</script>

<svelte:head>
	<title>{person.nama} - CekWakil</title>
	<meta
		name="description"
		content="Arsip kutipan {person.nama}, {person.jabatan}{person.partai ? ` (${person.partai})` : ''} — dengan tanggal, konteks, dan tautan sumber."
	/>
	<meta property="og:title" content={`${person.nama} — ${person.jabatan}`} />
	<meta
		property="og:description"
		content={person.bio
			? String(person.bio).slice(0, 180)
			: `Profil dan arsip pernyataan ${person.nama}.`}
	/>
	<meta property="og:image" content={`${SITE_URL}/og/pejabat/${person.slug}`} />
	<meta property="og:url" content={`${SITE_URL}/pejabat/${person.slug}`} />
	<meta property="og:type" content="profile" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<section class="container section">
	<nav class="crumbs tiny" aria-label="Breadcrumb">
		<a href="/pejabat">Pejabat</a>
		<span aria-hidden="true">/</span>
		{#if person.partai}
			<a href={`/pejabat?partai=${encodeURIComponent(String(person.partai))}`}>{person.partai}</a>
			<span aria-hidden="true">/</span>
		{/if}
		<span aria-current="page">{person.nama}</span>
	</nav>

	<!-- Masthead: nama besar, metadata satu baris, facts sebagai tabel ber-garis -->
	<header class="masthead">
		<div class="mast-top">
			<div class="mast-id">
				<PejabatAvatar kelas="mast-avatar" nama={String(person.nama)} foto={person.foto_url ? String(person.foto_url) : null} />
				<div class="minw">
					<h1>{person.nama}</h1>
					<p class="meta">
						<span>{person.jabatan}</span>
						{#if person.partai}<span class="sep">·</span><span>{person.partai}</span>{/if}
						{#if person.instansi && person.instansi !== person.jabatan}
							<span class="sep">·</span><span>{person.instansi}</span>
						{/if}
					</p>
				</div>
			</div>
			<div class="mast-actions">
				<ShareButton
					isian={true}
					dataKartu={{
						jenis: 'profil',
						nama: String(person.nama),
						jabatan: String(person.jabatan),
						meta: [person.jabatan, person.partai, person.dapil, person.komisi]
							.filter(Boolean)
							.join('  ·  '),
						jumlahKutipan: pernyataan.length,
						jumlahKasus: kasus.length,
						foto: person.foto_url ? String(person.foto_url) : null
					}}
				/>
				<a class="btn btn-secondary btn-sm" href={`/banding?a=${person.slug}`}>Bandingkan</a>
				<a class="btn btn-secondary btn-sm" href={`/pejabat/${person.slug}/edit`}>Sunting profil</a>
				{#if person.wikipedia_url}
					<a
						class="btn btn-secondary btn-sm"
						href={String(person.wikipedia_url)}
						target="_blank"
						rel="noopener noreferrer">Wikipedia ↗</a
					>
				{/if}
			</div>
		</div>

		<ul class="facts">
			{#if person.partai}
				<li><span class="f-label">Partai</span><span class="f-value">{person.partai}</span></li>
			{/if}
			{#if person.dapil}
				<li><span class="f-label">Dapil</span><span class="f-value">{person.dapil}</span></li>
			{/if}
			{#if person.komisi}
				<li><span class="f-label">Komisi</span><span class="f-value">{person.komisi}</span></li>
			{/if}
			{#if person.suara}
				<li>
					<span class="f-label">Perolehan suara</span>
					<span class="f-value num">{Number(person.suara).toLocaleString('id-ID')}</span>
				</li>
			{:else}
				<!-- Sengaja tetap ditampilkan: menyembunyikan barisnya membuat
				     pembaca mengira data lengkap, padahal 61 profil belum punya
				     angka suara. Yang kosong harus terlihat kosong. -->
				<li>
					<span class="f-label">Perolehan suara</span>
					<span class="f-value kosong">belum ada</span>
				</li>
			{/if}
		</ul>

		{#if person.bio}
			<div class="bio md">{@html data.bioHtml}</div>
			{#if person.sumber_bio}
				<p class="tiny bio-src">
					<a href={String(person.sumber_bio)} target="_blank" rel="noopener noreferrer">Sumber bio ↗</a>
				</p>
			{/if}
		{/if}
	</header>

	<div class="body">
		<div class="content">
			{#if kasus.length === 0}
				<section id="kasus" class="blk kosong-blok">
					<div class="blk-head"><h2>Kasus korupsi</h2></div>
					<p class="small muted">
						Tidak ada kasus korupsi yang tercatat di arsip ini untuk {person.nama}. Ini bukan bukti
						bahwa tidak ada — arsip hanya memuat yang sudah dilaporkan dengan sumber.
					</p>
					<div class="blok-aksi">
						<a class="btn btn-secondary btn-sm" href={`/rekam?pejabat=${person.slug}`}
							>Laporkan rekam jejak</a
						>
					</div>
				</section>
			{:else}
				<section id="kasus" class="blk">
					<div class="blk-head">
						<h2>Kasus korupsi</h2>
						{#if totalNominal > 0}
							<span class="blk-meta">Total tercatat {fmtRp(totalNominal)}</span>
						{/if}
					</div>
					<div class="kasus-card">
						<ul class="kasus-list">
							{#each kasus as k (k.id)}
								<li class="kasus">
									<div class="kasus-top">
										<h3>{k.nama_kasus}</h3>
										{#if k.nominal_rp}
											<span class="kasus-nominal num">{fmtRp(Number(k.nominal_rp))}</span>
										{/if}
									</div>
									<div class="kasus-meta">
										{#if k.peran}<span class="status status-error">{k.peran}</span>{/if}
										{#if k.status}<span class="status">{k.status}</span>{/if}
										{#if k.tahun}<span class="tiny muted num">{k.tahun}</span>{/if}
										<a
											class="tiny kasus-src"
											href={String(k.sumber_url)}
											target="_blank"
											rel="noopener noreferrer">Sumber ↗</a
										>
									</div>
								</li>
							{/each}
						</ul>
						<p class="legal">
							Status hukum bisa berubah dan peran bisa berbeda-beda (tersangka ≠ terpidana). Selalu
							baca sumber terbaru sebelum menyimpulkan.
						</p>
					</div>
				</section>
			{/if}

			{#if harta.length === 0}
				<section id="harta" class="blk kosong-blok">
					<div class="blk-head"><h2>Riwayat LHKPN</h2></div>
					<p class="small muted">
						Belum ada laporan harta (LHKPN) yang tercatat. Laporan resmi ada di e-LHKPN KPK — kalau
						kamu mengutipnya, sertakan tautan dokumennya.
					</p>
					<div class="blok-aksi">
						<a class="btn btn-secondary btn-sm" href={`/harta?pejabat=${person.slug}`}
							>Tambah data LHKPN</a
						>
					</div>
				</section>
			{:else}
				<section id="harta" class="blk">
					<div class="blk-head">
						<h2>Riwayat LHKPN</h2>
						<a class="tiny" href="/harta">Tambah laporan</a>
					</div>
					<div class="chart-card">
						<div class="chart-top">
							<p class="chart-cap">Total harta dilaporkan</p>
							{#if hartaTerakhir}
								<p class="chart-last">
									Terakhir <strong class="num">{hartaTerakhir.total_harta ? fmtRp(Number(hartaTerakhir.total_harta)) : '—'}</strong>
								</p>
							{/if}
						</div>
						<ul class="cols" aria-label="Grafik total harta per tahun">
							{#each hartaNaik as h, i (h.tahun)}
								{@const v = Number(h.total_harta) || 0}
								{@const hgt = Math.max(6, Math.round((v / maxHarta) * 100))}
								{@const d = delta(i)}
								<li class="col" class:now={i === hartaNaik.length - 1}>
									<span class="col-val num">{v ? fmtRp(v) : '—'}</span>
									<span class="col-bar" style={`height:${hgt}%`}></span>
									<span class="col-year num">{h.tahun}</span>
									<span class="col-delta num" class:up={d !== null && d > 0} class:down={d !== null && d < 0}>
										{d === null ? 'tahun awal' : `${d > 0 ? '+' : '−'} ${fmtRp(Math.abs(d))}`}
									</span>
								</li>
							{/each}
						</ul>
						<p class="legal">
							Angka dari LHKPN yang dilaporkan publik. Periksa dokumen aslinya sebelum mengutip:
							{#each harta as h, i (h.tahun)}{#if h.lhkpn_url}{#if i > 0}<span class="muted"> · </span>{/if}<a
										href={String(h.lhkpn_url)}
										target="_blank"
										rel="noopener noreferrer">{h.tahun}</a
									>{/if}{/each}.
						</p>
					</div>
				</section>
			{/if}

			{#if rekam.length > 0}
				<section id="rekam" class="blk">
					<div class="blk-head">
						<h2>Rekam jejak</h2>
						<a class="tiny" href="/rekam">Tambah</a>
					</div>
					<ol class="timeline">
						{#each rekam as r (r.id)}
							<li>
								<span class="tl-year num">{r.tahun ?? '—'}</span>
								<div class="tl-body">
									<h3>{r.judul}</h3>
									{#if r.uraian}<p class="small muted">{r.uraian}</p>{/if}
									<a
										class="tiny"
										href={String(r.sumber_url)}
										target="_blank"
										rel="noopener noreferrer">Sumber berita ↗</a
									>
								</div>
							</li>
						{/each}
					</ol>
				</section>
			{/if}

			<section id="pernyataan" class="blk">
				<div class="blk-head">
					<h2>Kutipan terarsip</h2>
					<span class="blk-meta">{pernyataan.length} entri</span>
				</div>

				{#if pernyataan.length === 0}
					<div class="empty-inline">
						<p class="small">
							<strong>Belum ada kutipan terarsip untuk {person.nama}.</strong>
							Tahu ada yang terlewat? Laporkan dengan kutipan dan tautan beritanya.
						</p>
						<a href="/submit" class="btn btn-sm">Lapor kutipan</a>
					</div>
				{:else}
					<ul class="quotes">
						{#each pernyataan as p, i (p.id)}
							<li>
								<EntryCard
									e={p}
									sumber={data.sumberMap[p.id as number] ?? []}
									namaPejabat={String(person.nama)}
									jabatanPejabat={String(person.jabatan)}
									nomor={i + 1}
								/>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>

		<!-- Rail "Sekilas" + jump list, menggantikan TOC kiri yang ruangnya terbuang -->
		<aside class="rail" aria-label="Sekilas profil">
			<div class="rail-card">
				<div class="rail-head"><h2>Sekilas</h2><span class="rule"></span></div>
				<dl class="rail-stats">
					<div>
						<dt>Kutipan terarsip</dt>
						<dd class="num">{pernyataan.length}</dd>
					</div>
					<div>
						<dt>Kasus tercatat</dt>
						<dd class="num" class:zero={kasus.length === 0}>
							{kasus.length}{#if kasus.length === 0}<span class="nol">tidak ada</span>{/if}
						</dd>
					</div>
					<div>
						<dt>Harta terakhir (LHKPN)</dt>
						<dd class="num" class:zero={!hartaTerakhir?.total_harta}>
							{#if hartaTerakhir?.total_harta}
								{fmtRp(Number(hartaTerakhir.total_harta))}
							{:else}
								—<span class="nol">belum dilaporkan</span>
							{/if}
						</dd>
					</div>
				</dl>
				<p class="rail-note tiny">
					Angka nol berarti <strong>belum ada di arsip</strong>, bukan berarti tidak pernah terjadi.
					{#if kasus.length === 0}Kalau kamu punya sumbernya, <a href={`/laporkan?pejabat=${person.slug}`}
								>laporkan</a
							>.{/if}
				</p>
			</div>

			<div class="rail-card">
				<div class="rail-head">
					<h2>Kelengkapan</h2>
					<span class="rule"></span>
					<span class="skor num" class:penuh={skor === 100}>{skor}%</span>
				</div>
				<p class="status status-{status.nada}">{status.teks}</p>
				<div class="meter" role="img" aria-label={`Profil terisi ${skor} persen`}>
					<span style={`width:${skor}%`}></span>
				</div>
				{#if belum.length > 0}
					<p class="rail-label2">Belum ada</p>
					<ul class="kurang">
						{#each belum as b (b.kunci)}
							<li>
								{#if b.tautan}<a href={b.tautan}>{b.label}<span aria-hidden="true">+</span></a
									>{:else}{b.label}{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="helper">Semua kolom sudah terisi. Terima kasih.</p>
				{/if}
			</div>

			<div class="rail-card">
				<p class="rail-label">Lompat ke bagian</p>
				<nav class="rail-nav">
					{#each bagian as b (b.id)}
						<a href={`#${b.id}`}><span class="no num">{b.no}</span>{b.label}</a>
					{/each}
				</nav>
				<div class="rail-add">
					<a href={`/submit?pejabat=${person.slug}`}>+ Kutipan untuk dia</a>
					<a href={`/harta?pejabat=${person.slug}`}>+ Data LHKPN</a>
					<a href={`/rekam?pejabat=${person.slug}`}>+ Rekam jejak</a>
				</div>
			</div>

			<p class="rail-legal">
				Status hukum dapat berubah dan peran berbeda-beda (tersangka ≠ terpidana). Selalu baca sumber
				terbaru sebelum menyimpulkan.
			</p>
		</aside>
	</div>
</section>

<style>
	.crumbs {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 18px;
		color: var(--text-3);
	}
	.crumbs a {
		color: var(--text-2);
		text-decoration: none;
	}
	.crumbs a:hover {
		text-decoration: underline;
	}

	/* --- masthead --- */
	.masthead {
		padding-bottom: 24px;
		border-bottom: 1px solid var(--line);
	}
	.mast-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 32px;
	}
	.mast-id {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		min-width: 0;
	}
	.minw {
		min-width: 0;
	}
	.mast-avatar {
		margin-top: 10px;
	}
	h1 {
		max-width: 760px;
		font-size: clamp(34px, 4.6vw, 56px);
		font-weight: 660;
		line-height: 1.02;
		letter-spacing: -0.04em;
		text-wrap: balance;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin: 12px 0 0;
		font-size: 15px;
		font-weight: 500;
		color: var(--text-2);
	}
	.sep {
		color: var(--n-300);
	}
	.mast-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		flex-shrink: 0;
		padding-top: 6px;
	}

	/* facts: tabel ber-garis, bukan floating labels */
	.facts {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		border-top: 1px solid var(--line);
		/* Tanpa border-bottom: masthead sudah memberi garis penutup. Dua
		   garis yang menempel (saat bio kosong) terbaca sebagai elemen
		   kosong yang rusak. */
	}
	/* Sel facts yang datanya belum ada: tetap tampil, tapi jelas berbeda. */
	.f-value.kosong {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-3);
		font-style: italic;
	}
	.facts li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 72px;
		padding: 12px 20px;
		border-left: 1px solid var(--line);
		min-width: 0;
	}
	/* Kalau selnya lebih dari empat (atau wrap di layar sempit), pisahkan
	   baris dengan garis — tanpa ini baris kedua tampil tanpa konten
	   karena hanya ada garis atas & bawah. */
	.facts li:nth-child(n + 5) {
		border-top: 1px solid var(--line);
	}
	.facts li:first-child {
		border-left: none;
		padding-left: 0;
	}
	.f-label {
		font-size: 11.5px;
		color: var(--text-3);
	}
	.f-value {
		font-size: 15px;
		font-weight: 600;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}
	.bio {
		margin: 16px 0 0;
		max-width: 70ch;
		font-size: 15px;
		line-height: 1.65;
		color: var(--text-2);
	}
	.md :global(p) {
		margin: 0 0 8px;
	}
	.md :global(p:last-child) {
		margin-bottom: 0;
	}
	.md :global(ul),
	.md :global(ol) {
		margin: 0 0 8px;
		padding-left: 20px;
	}
	.md :global(code) {
		font-family: ui-monospace, monospace;
		font-size: 0.9em;
		padding: 1px 4px;
		background: var(--n-100);
		border-radius: 3px;
	}
	.bio-src {
		margin: 4px 0 0;
	}

	/* --- layout: konten + rail kanan --- */
	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		gap: 40px;
		align-items: start;
		margin-top: 30px;
	}
	.content {
		min-width: 0;
	}
	.blk {
		margin-bottom: 36px;
		scroll-margin-top: calc(var(--header-h) + 16px);
	}
	.blk-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.blk-head h2 {
		font-size: 20px;
	}
	.blk-meta {
		font-size: 12.5px;
		color: var(--text-2);
	}

	/* --- kasus --- */
	.kasus-card {
		padding: 16px 18px;
		background: var(--danger-soft);
		border: 1px solid var(--danger-line);
		border-radius: var(--radius-lg);
	}
	.kasus-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.kasus {
		padding: 12px 0;
		border-top: 1px solid var(--danger-line);
	}
	.kasus:first-child {
		padding-top: 0;
		border-top: none;
	}
	.kasus-top {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		align-items: baseline;
	}
	.kasus h3 {
		font-size: 15.5px;
		font-weight: 620;
	}
	.kasus-nominal {
		font-size: 15px;
		font-weight: 680;
		color: var(--danger);
		white-space: nowrap;
	}
	.kasus-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 6px;
	}
	.kasus-src {
		white-space: nowrap;
	}

	/* --- LHKPN: grafik kolom --- */
	.chart-card {
		padding: 18px 18px 14px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.chart-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.chart-cap {
		margin: 0;
		font-size: 12.5px;
		font-weight: 500;
		color: var(--text-2);
	}
	.chart-last {
		margin: 0;
		font-size: 12.5px;
		color: var(--text-2);
	}
	.chart-last strong {
		color: var(--text);
	}
	.cols {
		list-style: none;
		margin: 0;
		padding: 0;
		/* Kolom mengikuti lebar tetap supaya 1 tahun tidak jadi batang raksasa,
		   dan 10 tahun tetap rapi (scroll horizontal kalau lebih). */
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 96px);
		justify-content: start;
		gap: 16px;
		height: 210px;
		overflow-x: auto;
		border-bottom: 1px solid var(--line);
		scrollbar-width: thin;
	}
	.col {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}
	.col-val {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-2);
		white-space: nowrap;
	}
	.col-bar {
		width: 100%;
		max-width: 64px;
		min-height: 6px;
		background: var(--accent-soft);
		border: 1px solid var(--accent-line);
		border-bottom: none;
		border-radius: 3px 3px 0 0;
	}
	.col.now .col-bar {
		background: var(--accent);
		border-color: var(--accent);
	}
	.col-year {
		margin-top: 8px;
		font-size: 12.5px;
		font-weight: 600;
	}
	.col-delta {
		font-size: 11px;
		color: var(--text-3);
		white-space: nowrap;
	}
	.col-delta.up {
		color: var(--danger);
	}
	.col-delta.down {
		color: var(--ok);
	}
	.legal {
		margin: 12px 0 0;
		padding-top: 10px;
		border-top: 1px dashed var(--line);
		font-size: 12.5px;
		line-height: 1.45;
		color: var(--text-2);
	}

	/* --- rekam jejak: timeline --- */
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0 0 0 4px;
		display: flex;
		flex-direction: column;
	}
	.timeline li {
		position: relative;
		display: grid;
		grid-template-columns: 56px minmax(0, 1fr);
		gap: 16px;
		padding: 0 0 22px 0;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: 68px;
		top: 6px;
		bottom: -6px;
		width: 1px;
		background: var(--line);
	}
	.timeline li:last-child::before {
		display: none;
	}
	.tl-year {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-3);
		padding-top: 2px;
	}
	.tl-body {
		position: relative;
		padding-left: 18px;
		min-width: 0;
	}
	.tl-body::before {
		content: '';
		position: absolute;
		left: -3px;
		top: 7px;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--surface);
		border: 1.5px solid var(--n-300);
	}
	.timeline li:first-child .tl-body::before {
		border-color: var(--accent);
		background: var(--accent);
	}
	.tl-body h3 {
		font-size: 15px;
		font-weight: 620;
		margin-bottom: 2px;
	}
	.tl-body p {
		margin-bottom: 4px;
	}

	.quotes {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.empty-inline {
		padding: 16px 18px;
		background: var(--surface);
		border: 1px dashed var(--line-strong);
		border-radius: var(--radius-lg);
	}
	.empty-inline p {
		margin-bottom: 12px;
	}

	/* --- rail --- */
	.rail {
		position: sticky;
		top: calc(var(--header-h) + 20px);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.rail-card {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.rail-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}
	.rail-head h2 {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.rule {
		flex: 1;
		height: 1px;
		background: var(--line);
	}

	/* --- kelengkapan profil --- */
	.skor {
		font-size: 13px;
		font-weight: 700;
		color: var(--text-2);
	}
	.skor.penuh {
		color: var(--ok);
	}
	.rail-card .status {
		display: inline-block;
		margin: 8px 0 0;
	}
	.meter {
		height: 6px;
		margin: 10px 0 4px;
		border-radius: var(--radius-pill);
		background: var(--n-100);
		overflow: hidden;
	}
	.meter span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--accent);
		transition: width 0.4s var(--ease);
	}
	.rail-label2 {
		margin: 14px 0 6px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.kurang {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.kurang li {
		font-size: 13px;
	}
	.kurang a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 5px 0;
		color: var(--text-2);
		text-decoration: none;
		border-bottom: 1px solid var(--line);
	}
	.kurang li:last-child a {
		border-bottom: none;
	}
	.kurang a:hover {
		color: var(--accent);
	}
	.kurang a span {
		font-weight: 700;
		color: var(--accent);
	}
	.rail-stats {
		margin: 0;
	}
	.rail-stats > div {
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	.rail-stats > div:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.rail-stats dt {
		font-size: 11.5px;
		color: var(--text-3);
	}
	.rail-stats dd {
		margin: 2px 0 0;
		font-size: 20px;
		font-weight: 660;
		letter-spacing: -0.02em;
	}
	.rail-stats dd.zero {
		color: var(--text-3);
	}
	.rail-stats dd .nol {
		display: block;
		font-size: 11.5px;
		font-weight: 500;
		letter-spacing: 0;
		color: var(--text-3);
	}
	.rail-note {
		margin: 12px 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--line);
		color: var(--text-3);
		line-height: 1.5;
	}

	/* Blok kosong: tetap tampil supaya "tidak tercatat" bukan berarti "tidak ada". */
	.kosong-blok {
		padding: 16px 18px;
		border: 1px dashed var(--line-strong);
		border-radius: var(--radius-lg);
		background: var(--surface-sunken);
	}
	.kosong-blok .blk-head {
		margin-bottom: 8px;
	}
	.kosong-blok p {
		max-width: 66ch;
	}
	.blok-aksi {
		margin-top: 12px;
	}
	.rail-label {
		margin: 0 0 6px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.rail-nav {
		display: flex;
		flex-direction: column;
	}
	.rail-nav a {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
		font-size: 13px;
		color: var(--text-2);
		text-decoration: none;
	}
	.rail-nav a:hover {
		color: var(--accent);
	}
	.rail-nav .no {
		font-size: 11px;
		color: var(--text-3);
	}
	.rail-add {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid var(--line);
		font-size: 12.5px;
	}
	.rail-add a {
		padding: 3px 0;
	}
	.rail-legal {
		margin: 0;
		padding: 10px 12px;
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--text-2);
		border-left: 2px solid var(--line-strong);
		background: var(--n-50);
		border-radius: 0 var(--radius) var(--radius) 0;
	}

	@media (max-width: 900px) {
		.body {
			grid-template-columns: 1fr;
			gap: 22px;
		}
		/* Rail naik ke atas sebagai strip horizontal ringkas. */
		.rail {
			position: static;
			order: -1;
		}
		.rail-stats {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.rail-stats > div {
			padding: 0 12px;
			border-bottom: none;
			border-left: 1px solid var(--line);
		}
		.rail-stats > div:first-child {
			padding-left: 0;
			border-left: none;
		}
		.rail-stats dd {
			font-size: 17px;
		}
		.rail-nav {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 6px;
		}
		.rail-nav a {
			padding: 4px 10px;
			border: 1px solid var(--line);
			border-radius: var(--radius-pill);
			font-size: 12.5px;
		}
		.rail-legal {
			display: none;
		}
	}
	@media (max-width: 720px) {
		.mast-top {
			flex-direction: column;
			gap: 14px;
		}
		.mast-avatar {
			width: 42px;
			height: 42px;
			font-size: 15px;
			margin-top: 6px;
		}
		.facts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.facts li {
			padding: 10px 14px;
			min-height: 62px;
		}
		/* Dua kolom: baris kedua dan seterusnya butuh garis pemisah. */
		.facts li:nth-child(n + 3) {
			border-top: 1px solid var(--line);
		}
		.facts li:nth-child(odd) {
			padding-left: 0;
			border-left: none;
		}
		.facts li:nth-child(n + 3) {
			border-top: 1px solid var(--line);
		}
		.cols {
			height: 170px;
			gap: 8px;
		}
		.col-val {
			font-size: 10.5px;
		}
		.col-delta {
			display: none;
		}
		.timeline li {
			grid-template-columns: 42px minmax(0, 1fr);
			gap: 10px;
		}
		.timeline li::before {
			left: 48px;
		}
	}
</style>
