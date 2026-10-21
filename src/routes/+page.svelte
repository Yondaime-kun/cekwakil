<script lang="ts">
	import { goto } from '$app/navigation';
	import EntryCard from '#lib/components/EntryCard.svelte';
	import { SITE_URL } from '#lib/site';
	import { fmtDate } from '#lib/utils';

	let { data } = $props();
	const counts = $derived(data.counts);
	const latest = $derived(data.latest as Array<Record<string, unknown>>);
	const terlapor = $derived(data.terlapor as Array<Record<string, unknown>>);
	const ringkas = $derived(data.ringkas as Record<string, unknown>);

	let cari = $state('');

	// Enter di hero langsung ke arsip dengan query, bukan halaman kosong.
	function cariArsip(e: SubmitEvent) {
		e.preventDefault();
		const q = cari.trim();
		goto(q ? `/blunder?q=${encodeURIComponent(q)}` : '/blunder');
	}

	const stat = $derived([
		{ num: counts.pejabat, lbl: 'Pejabat terdata', href: '/pejabat' },
		{ num: counts.pernyataan, lbl: 'Kutipan terarsip', href: '/blunder' },
		{ num: counts.partai, lbl: 'Partai & faksi', href: '/pejabat?urut=kutipan' }
	]);
</script>

<svelte:head>
	<title>CekWakil - Arsip pernyataan pejabat Indonesia</title>
	<meta
		name="description"
		content="Arsip publik kutipan anggota DPR RI dan pejabat negara — dengan tanggal, konteks, dan tautan sumber berita yang diarsipkan permanen."
	/>
	<meta property="og:title" content="CekWakil - Arsip pernyataan pejabat" />
	<meta
		property="og:description"
		content="Arsip pernyataan pejabat publik — kutipan verbatim, tanggal, konteks, dan tautan sumber berita."
	/>
	<meta property="og:image" content={`${SITE_URL}/logo.svg`} />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:site_name" content="CekWakil" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<section class="hero">
	<div class="container">
		<h1>Arsip pernyataan<br class="d" /> pejabat publik</h1>
		<p class="lede">
			Kutipan verbatim, tanggal, konteks, dan tautan sumber berita — untuk setiap pernyataan yang
			tercatat. Tanpa opini, tanpa potongan yang mengubah makna. Siapa pun bisa menambah, siapa pun
			bisa mengoreksi.
		</p>

		<form class="herosearch" onsubmit={cariArsip} role="search">
			<svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
				<circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
				<path d="m13 13 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
			</svg>
			<input
				name="q"
				bind:value={cari}
				type="search"
				placeholder="Cari kata dalam kutipan, nama pejabat, atau dapil…"
				aria-label="Cari di arsip"
			/>
			<button class="btn" type="submit">Cari</button>
		</form>

		<div class="actions">
			<a href="/blunder" class="btn btn-secondary">Lihat arsip lengkap</a>
			<a href="/submit" class="btn btn-secondary">Lapor pernyataan</a>
		</div>
	</div>
</section>

<section class="stats-wrap">
	<div class="container stats">
		{#each stat as s (s.lbl)}
			<a class="stat" href={s.href}>
				<span class="stat-num num">{s.num.toLocaleString('id-ID')}</span>
				<span class="stat-lbl">{s.lbl}</span>
			</a>
		{/each}
	</div>
</section>

<section class="container section">
	<div class="home-body">
		<div class="main-col">
			<div class="section-head">
				<div class="blk-head">
					<h2>Terbaru</h2>
					<span class="rule"></span>
					<span class="tiny muted">{latest.length} entri terakhir</span>
				</div>
				<a href="/blunder" class="small">Semua pernyataan →</a>
			</div>

			{#if latest.length === 0}
				<div class="card empty">
					<h3>Arsip masih kosong</h3>
					<p class="small muted">
						Belum ada pernyataan tercatat. Kalau kamu menemukan pernyataan pejabat yang layak dicatat,
						sertakan kutipan dan tautan beritanya lewat form lapor.
					</p>
					<p><a href="/submit" class="btn btn-sm">Lapor pernyataan pertama</a></p>
				</div>
			{:else}
				<ul class="list">
					{#each latest as item, i (item.id)}
						<li>
							<EntryCard
								e={item}
								sumber={data.sumberMap[item.id as number] ?? []}
								tampilkanNama={true}
								nomor={i + 1}
							/>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<aside class="rail" aria-label="Sekilas arsip">
			<div class="rail-card">
				<div class="rail-head"><h2>Sekilas</h2><span class="rule"></span></div>
				<dl class="rail-stats">
					<div>
						<dt>Entri 7 hari terakhir</dt>
						<dd class="num">{Number(ringkas.pekanIni ?? 0)}</dd>
					</div>
					<div>
						<dt>Kategori terpakai</dt>
						<dd class="num">{Number(ringkas.kategori ?? 0)}</dd>
					</div>
					<div>
						<dt>Kutipan terakhir</dt>
						<dd class="num small-dd">{ringkas.terakhir ? fmtDate(String(ringkas.terakhir)) : '—'}</dd>
					</div>
				</dl>
			</div>

			<div class="rail-card">
				<p class="rail-label">Jelajahi</p>
				<nav class="rail-nav">
					<a href="/blunder"><span class="no num">01</span>Semua kutipan</a>
					<a href="/pejabat"><span class="no num">02</span>Direktori pejabat</a>
					<a href="/harta"><span class="no num">03</span>Harta (LHKPN)</a>
					<a href="/panduan"><span class="no num">04</span>Panduan DPR</a>
				</nav>
				<div class="rail-add">
					<a href="/submit">+ Lapor pernyataan</a>
					<a href="/pejabat/tambah">+ Tambah pejabat</a>
				</div>
			</div>

			<p class="rail-legal">
				Arsip ini diisi publik. Setiap entri wajib punya kutipan verbatim dan tautan sumber — yang
				tidak sesuai sumber bisa dilaporkan dan ditarik.
			</p>
		</aside>
	</div>
</section>

<section class="container section">
	<div class="dual">
		<div class="how">
			<h2 class="h-sm">Cara kerja</h2>
			<ol class="steps">
				<li>
					<span class="stepnum">1</span>Kamu mengirim kutipan dan tautan beritanya. Sistem mengarsipkan
					tiap sumber ke Wayback Machine.
				</li>
				<li>
					<span class="stepnum">2</span>Entri langsung tayang — model wiki. Tidak ada antrean moderasi
					sebelum publikasi.
				</li>
				<li>
					<span class="stepnum">3</span>Kalau tidak sesuai sumber, siapa pun bisa melaporkan; entri
					ditarik dan alasannya dicatat permanen.
				</li>
			</ol>
			<p class="tiny muted rule">
				Hanya pernyataan publik bersumber berita. Tidak ada tuduhan anonim tanpa bukti.
			</p>
		</div>

		<div class="populer">
			<h2 class="h-sm">Paling banyak kutipan</h2>
			{#if terlapor.length === 0}
				<p class="small muted">Belum ada data.</p>
			{:else}
				<ol class="rank">
					{#each terlapor as p, i (p.slug)}
						<li>
							<a href={`/pejabat/${p.slug}`}>
								<span class="ranknum num">{String(i + 1).padStart(2, '0')}</span>
								<span class="ranknama">{p.nama}</span>
								<span class="rankjml num">{p.jumlah}</span>
							</a>
						</li>
					{/each}
				</ol>
			{/if}
			<p class="tiny muted rule">
				Banyak kutipan bukan berarti buruk — ini ukuran seberapa sering dia bersuara publik.
			</p>
		</div>
	</div>
</section>

<style>
	.hero {
		padding: 58px 0 40px;
		border-bottom: 1px solid var(--line);
	}
	h1 {
		max-width: 20ch;
		font-size: clamp(34px, 5.4vw, 62px);
		font-weight: 660;
		line-height: 1.03;
		letter-spacing: -0.04em;
		text-wrap: balance;
	}
	.lede {
		max-width: 62ch;
		margin-top: 18px;
		font-size: 16.5px;
		line-height: 1.65;
		color: var(--text-2);
	}
	.herosearch {
		display: flex;
		align-items: center;
		gap: 10px;
		max-width: 580px;
		margin-top: 26px;
		padding: 6px 6px 6px 14px;
		background: var(--surface);
		border: 1px solid var(--line-strong);
		border-radius: 8px;
		box-shadow: var(--shadow-card);
		transition:
			border-color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}
	.herosearch:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.herosearch svg {
		color: var(--text-3);
		flex: 0 0 auto;
	}
	.herosearch input {
		flex: 1 1 auto;
		min-width: 0;
		border: none;
		background: none;
		font: inherit;
		font-size: 15px;
		color: var(--text);
		outline: none;
	}
	.herosearch input::placeholder {
		color: var(--text-3);
	}
	.actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 14px;
	}
	.stats-wrap {
		border-bottom: 1px solid var(--line);
		background: var(--surface);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 18px 0;
		text-decoration: none;
		color: inherit;
	}
	.stat:hover {
		text-decoration: none;
	}
	.stat:hover .stat-num {
		color: var(--accent);
	}
	.stat + .stat {
		padding-left: 24px;
		border-left: 1px solid var(--line);
	}
	.stat-num {
		font-size: 28px;
		font-weight: 660;
		line-height: 1.15;
		letter-spacing: -0.02em;
		transition: color 120ms var(--ease);
	}
	.stat-lbl {
		font-size: 13px;
		color: var(--text-2);
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.blk-head {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1 1 auto;
		min-width: 0;
	}
	.blk-head h2 {
		font-size: 20px;
		white-space: nowrap;
	}
	.blk-head .rule {
		flex: 1 1 auto;
		height: 1px;
		background: var(--line);
		min-width: 16px;
	}

	/* Konten + rail kanan, konsisten dengan halaman profil */
	.home-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		gap: 40px;
		align-items: start;
	}
	.main-col {
		min-width: 0;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
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
	.rail-stats dd.small-dd {
		font-size: 15px;
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

	.dual {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
		gap: 40px;
	}
	.h-sm {
		font-size: 19px;
		margin-bottom: 14px;
	}
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
		font-size: 15px;
		color: var(--text-2);
	}
	.steps li {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}
	.stepnum {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		margin-top: 2px;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		background: var(--accent-soft);
		border: 1px solid var(--accent-line);
		border-radius: 50%;
	}
	.rank {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	.rank a {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 2px;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: var(--text);
	}
	.rank a:hover {
		text-decoration: none;
	}
	.rank a:hover .ranknama {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.ranknum {
		font-size: 11.5px;
		color: var(--text-3);
		width: 18px;
	}
	.ranknama {
		font-size: 14.5px;
		font-weight: 560;
		flex: 1 1 auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rankjml {
		font-size: 13px;
		font-weight: 650;
		color: var(--accent);
	}
	.rule {
		margin-top: 14px;
	}
	.empty h3 {
		margin-bottom: 8px;
	}
	.empty p {
		max-width: 52ch;
	}
	@media (max-width: 900px) {
		.home-body {
			grid-template-columns: 1fr;
			gap: 22px;
		}
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
	@media (max-width: 820px) {
		.dual {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}
	@media (max-width: 720px) {
		.hero {
			padding: 32px 0 26px;
		}
		.lede {
			font-size: 15.5px;
		}
		.stats {
			grid-template-columns: 1fr;
		}
		.stat {
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
			padding: 11px 0;
		}
		.stat + .stat {
			padding-left: 0;
			border-left: none;
			border-top: 1px solid var(--line);
		}
		.stat-num {
			font-size: 20px;
			order: 2;
		}
		.herosearch {
			padding: 4px 4px 4px 12px;
		}
		.herosearch .btn {
			min-height: 38px;
			padding: 6px 14px;
		}
		.actions .btn {
			flex: 1 1 auto;
		}
	}
</style>
