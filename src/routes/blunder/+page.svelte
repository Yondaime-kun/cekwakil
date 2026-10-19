<script lang="ts">
	import { fmtDate } from '#lib/utils';

	let { data } = $props();
	const rows = $derived(data.rows as Array<Record<string, unknown>>);
	const totalPages = $derived(Math.max(1, Math.ceil((data.total as number) / (data.perPage as number))));

	function pageUrl(n: number) {
		const p = new URLSearchParams();
		if (data.q) p.set('q', data.q);
		if (data.kategori) p.set('kategori', data.kategori);
		p.set('page', String(n));
		return `/blunder?${p.toString()}`;
	}
</script>

<svelte:head>
	<title>Arsip pernyataan - CekWakil</title>
	<meta
		name="description"
		content="Arsip pernyataan pejabat publik Indonesia dengan kutipan asli dan tautan sumber berita."
	/>
</svelte:head>

<section class="container section">
	<h1>Arsip pernyataan</h1>
	<p class="small muted intro">{data.total} entri terverifikasi</p>

	<form method="GET" class="filters">
		<div class="fgrow">
			<div class="fcol">
				<label class="label" for="q">Kutipan atau nama</label>
				<input class="input" id="q" name="q" value={data.q} placeholder="Contoh: anggaran" />
			</div>
			<div class="fcol">
				<label class="label" for="kategori">Kategori</label>
				<select class="input" id="kategori" name="kategori">
					<option value="">Semua</option>
					{#each data.kategoris as k (k)}
						<option value={k} selected={k === data.kategori}>{k}</option>
					{/each}
				</select>
			</div>
			<div class="fbtn">
				<button class="btn" type="submit">Filter</button>
			</div>
		</div>
	</form>

	{#if rows.length === 0}
		<div class="card empty">
			<h3>Belum ada entri</h3>
			<p class="small muted">
				Arsip ini diisi oleh komunitas. <a href="/submit">Laporkan pernyataan pertama</a>.
			</p>
		</div>
	{:else}
		<ul class="entries">
			{#each rows as r (r.id)}
				<li class="entry">
					<div class="entry-head">
						<a class="entry-name" href={`/pejabat/${r.slug}`}>{r.nama}</a>
						<span class="entry-meta tiny muted">
							{r.partai ?? 'Non-partai'}{r.jabatan ? `, ${r.jabatan}` : ''} &middot; {fmtDate(
								String(r.tanggal)
							)}
						</span>
					</div>
					<blockquote>{r.isi}</blockquote>
					{#if r.konteks}<p class="small muted konteks">{r.konteks}</p>{/if}
					<div class="entry-foot">
						<span class="chip">{r.kategori}</span>
						<span class="tiny srcline">
							{#each (data.sumberMap[r.id as number] ?? [{ url: r.sumber_url, arsip_url: r.arsip_url }]) as s, i (i)}
								<a href={String(s.url)} target="_blank" rel="noopener noreferrer">
									Sumber{data.sumberMap[r.id as number] && data.sumberMap[r.id as number].length > 1
										? ` ${i + 1}`
										: ''}
								</a>
								{#if s.arsip_url}
									<a
										class="arsip"
										href={String(s.arsip_url)}
										target="_blank"
										rel="noopener noreferrer"
										title="Snapshot arsip">↗ arsip</a
									>
								{/if}
							{/each}
							<span class="muted"> · </span>
							<a class="laporkan" href={`/laporkan?entri=${r.id}`}>Laporkan</a>
						</span>
					</div>
				</li>
			{/each}
		</ul>

		{#if totalPages > 1}
			<nav class="pager">
				{#if (data.page as number) > 1}
					<a href={pageUrl((data.page as number) - 1)} class="btn btn-sm btn-secondary">Sebelumnya</a>
				{:else}
					<span></span>
				{/if}
				<span class="tiny muted num">Halaman {data.page} dari {totalPages}</span>
				{#if (data.page as number) < totalPages}
					<a href={pageUrl((data.page as number) + 1)} class="btn btn-sm btn-secondary">Berikutnya</a>
				{:else}
					<span></span>
				{/if}
			</nav>
		{/if}
	{/if}
</section>

<style>
	.intro {
		margin-top: 6px;
	}
	.filters {
		margin: 24px 0 28px;
		padding: 16px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.fgrow {
		display: flex;
		gap: 12px;
		align-items: flex-end;
		flex-wrap: wrap;
	}
	.fcol {
		flex: 1 1 220px;
		min-width: 0;
	}
	.fbtn {
		flex: 0 0 auto;
	}
	@media (max-width: 640px) {
		.filters {
			margin: 16px 0 20px;
			padding: 12px;
		}
		.fgrow {
			gap: 6px;
		}
		.fcol {
			flex: 1 1 100%;
		}
		.fbtn {
			flex: 1 1 100%;
			margin-top: 2px;
		}
		.fbtn .btn {
			width: 100%;
		}
	}
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.entry {
		padding: 18px 20px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.entry-head {
		display: flex;
		flex-direction: column;
		gap: 1px;
		margin-bottom: 10px;
	}
	.entry-name {
		font-size: 15.5px;
		font-weight: 620;
		color: var(--text);
		text-decoration: none;
	}
	.entry-name:hover {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	blockquote {
		margin: 0 0 10px;
		padding-left: 14px;
		border-left: 2px solid var(--accent-line);
		font-size: 16px;
		line-height: 1.6;
	}
	.konteks {
		margin-bottom: 10px;
	}
	.entry-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.srcline {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}
	.srcline a {
		white-space: nowrap;
	}
	.arsip {
		color: var(--muted);
	}
	.laporkan {
		color: var(--muted);
	}
	.pager {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 24px;
	}
	.empty h3 {
		margin-bottom: 8px;
	}
	@media (max-width: 720px) {
		.fgrow {
			flex-direction: column;
			align-items: stretch;
		}
		.fbtn .btn {
			width: 100%;
		}
		blockquote {
			font-size: 15.5px;
		}
	}
</style>
