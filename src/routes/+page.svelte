<script lang="ts">
	import { fmtDate } from '#lib/utils';

	let { data } = $props();
	const counts = $derived(data.counts);
	const latest = $derived(data.latest as Array<Record<string, unknown>>);
</script>

<svelte:head>
	<title>CekWakil - Arsip pernyataan pejabat</title>
	<meta
		name="description"
		content="Database publik anggota DPR RI dan pejabat, lengkap dengan arsip pernyataan bermasalah beserta sumber berita."
	/>
</svelte:head>

<section class="hero">
	<div class="container">
		<p class="eyebrow">Arsip pernyataan pejabat publik</p>
		<h1>Apa yang mereka katakan, sebelum kamu memilih.</h1>
		<p class="lede">
			Kutipan asli, tanggal, dan tautan sumber berita untuk setiap pernyataan anggota DPR dan
			pejabat negara. Tidak ada opini, tidak ada potongan yang mengubah makna.
		</p>
		<div class="actions">
			<a href="/blunder" class="btn">Lihat arsip</a>
			<a href="/pejabat" class="btn btn-secondary">Cari pejabat</a>
		</div>
	</div>
</section>

<section class="stats-wrap">
	<div class="container stats">
		<div class="stat">
			<span class="stat-num">{counts.pejabat}</span>
			<span class="stat-lbl">Pejabat terdata</span>
		</div>
		<div class="stat">
			<span class="stat-num">{counts.pernyataan}</span>
			<span class="stat-lbl">Pernyataan terarsip</span>
		</div>
		<div class="stat">
			<span class="stat-num">{counts.partai}</span>
			<span class="stat-lbl">Partai dan faksi</span>
		</div>
	</div>
</section>

<section class="container section">
	<div class="section-head">
		<h2>Terbaru</h2>
		<a href="/blunder" class="small">Semua pernyataan</a>
	</div>

	{#if latest.length === 0}
		<div class="card empty">
			<h3>Arsip masih kosong</h3>
			<p class="small muted">
				Belum ada pernyataan tercatat. Kalau kamu menemukan pernyataan pejabat yang layak
				dicatat, sertakan kutipan dan tautan beritanya lewat form lapor.
			</p>
			<p><a href="/submit" class="btn btn-secondary btn-sm">Lapor pernyataan</a></p>
		</div>
	{:else}
		<ul class="list">
			{#each latest as item (item.id)}
				<li>
					<a class="row" href={`/pejabat/${item.slug}`}>
						<span class="row-main">
							<span class="row-name">{item.nama}</span>
							<span class="row-meta tiny muted">
								{item.jabatan}{item.partai ? `, ${item.partai}` : ''}
							</span>
						</span>
						<span class="row-side">
							<span class="chip">{item.kategori}</span>
							<span class="tiny muted num">{fmtDate(String(item.tanggal))}</span>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="container section">
	<div class="how">
		<div class="how-col">
			<h3>Cara kerja</h3>
			<ol class="steps">
				<li>Kamu mengirim kutipan pernyataan dan tautan beritanya.</li>
				<li>Entri langsung tayang — sama seperti wiki. Semua orang bisa membacanya seketika.</li>
				<li>Kalau kutipan tidak sesuai sumber, siapa pun bisa melaporkannya; entri yang keliru ditarik dan alasannya dicatat.</li>
			</ol>
		</div>
		<div class="how-col">
			<h3>Aturan main</h3>
			<p class="small muted">
				Hanya pernyataan publik yang punya sumber berita bisa diverifikasi. Tidak ada opini,
				tidak ada penyuntingan yang mengubah makna, tidak ada tuduhan anonim tanpa bukti.
			</p>
			<p><a href="/submit" class="btn btn-sm">Mulai lapor</a></p>
		</div>
	</div>
</section>

<style>
	.hero {
		padding: 56px 0 40px;
	}
	.eyebrow {
		font-size: 13px;
		font-weight: 560;
		color: var(--accent);
		margin-bottom: 14px;
	}
	h1 {
		max-width: 20ch;
		letter-spacing: -0.025em;
	}
	.lede {
		max-width: 60ch;
		margin-top: 16px;
		font-size: 17px;
		line-height: 1.65;
		color: var(--text-2);
	}
	.actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 26px;
	}
	@media (max-width: 480px) {
		.actions {
			flex-direction: column;
		}
		.actions .btn {
			width: 100%;
		}
	}
	.stats-wrap {
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		background: var(--n-0);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.stat {
		padding: 20px 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.stat + .stat {
		padding-left: 24px;
		border-left: 1px solid var(--line);
	}
	.stat-num {
		font-size: 30px;
		font-weight: 660;
		line-height: 1.15;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
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
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	.list li {
		border-bottom: 1px solid var(--line);
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 14px 4px;
		text-decoration: none;
		color: inherit;
	}
	.row:hover {
		background: var(--n-0);
		text-decoration: none;
	}
	.row:hover .row-name {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.row-main {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}
	.row-name {
		font-size: 15.5px;
		font-weight: 600;
	}
	.row-meta {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row-side {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}
	.how {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 40px;
	}
	.how-col h3 {
		margin-bottom: 10px;
	}
	.steps {
		margin: 0;
		padding-left: 20px;
		color: var(--text-2);
		font-size: 15px;
	}
	.steps li + li {
		margin-top: 6px;
	}
	.empty h3 {
		margin-bottom: 8px;
	}
	.empty p {
		max-width: 52ch;
	}
	@media (max-width: 720px) {
		.hero {
			padding: 36px 0 28px;
		}
		.lede {
			font-size: 16px;
		}
		.stats {
			grid-template-columns: 1fr;
		}
		.stat + .stat {
			padding-left: 0;
			border-left: none;
			border-top: 1px solid var(--line);
		}
		.row {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.row-meta {
			white-space: normal;
		}
		.how {
			grid-template-columns: 1fr;
			gap: 28px;
		}
		.actions .btn {
			flex: 1 1 auto;
		}
	}
</style>
