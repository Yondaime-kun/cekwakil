<script lang="ts">
	let { data } = $props();
	const rows = $derived(data.rows as Array<Record<string, unknown>>);
</script>

<svelte:head>
	<title>Pejabat - CekWakil</title>
	<meta name="description" content="Cari profil anggota DPR RI dan pejabat negara yang terdata di CekWakil." />
</svelte:head>

<section class="container section">
	<h1>Pejabat</h1>
	<p class="small muted intro">
		{data.total} profil dari DPR RI 2024-2029 dan Kabinet Merah Putih. Cari berdasarkan nama atau
		daerah pemilihan. Pejabat belum terdaftar? <a href="/pejabat/tambah">Tambahkan</a>.
	</p>

	<form method="GET" class="filters">
		<div class="fgrow">
			<div class="fcol">
				<label class="label" for="q">Nama atau dapil</label>
				<input class="input" id="q" name="q" value={data.q} placeholder="Contoh: Jakarta" />
			</div>
			<div class="fcol">
				<label class="label" for="partai">Partai atau faksi</label>
				<select class="input" id="partai" name="partai">
					<option value="">Semua</option>
					{#each data.partais as p (p)}
						<option value={p} selected={p === data.partai}>{p}</option>
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
			<h3>Tidak ada hasil</h3>
			<p class="small muted">Coba kata kunci lain atau hapus filter.</p>
			<p><a href="/pejabat" class="btn btn-secondary btn-sm">Reset</a></p>
		</div>
	{:else}
		<ul class="grid">
			{#each rows as r (r.id)}
				<li>
					<a class="person" href={`/pejabat/${r.slug}`}>
						<span class="person-name">{r.nama}</span>
						<span class="person-meta tiny muted">
							{r.jabatan}{r.partai ? `, ${r.partai}` : ''}
						</span>
						{#if r.dapil}<span class="person-meta tiny muted">{r.dapil}</span>{/if}
						{#if Number(r.jumlah) > 0}
							<span class="person-count tiny">{r.jumlah} pernyataan</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.intro {
		margin-top: 8px;
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
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 10px;
	}
	.person {
		display: flex;
		flex-direction: column;
		gap: 2px;
		height: 100%;
		padding: 14px 16px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition: border-color 120ms ease, box-shadow 120ms ease;
	}
	.person:hover {
		border-color: var(--accent-line);
		box-shadow: var(--shadow-card);
		text-decoration: none;
	}
	.person-name {
		font-size: 15px;
		font-weight: 600;
		line-height: 1.35;
	}
	.person:hover .person-name {
		color: var(--accent);
	}
	.person-meta {
		line-height: 1.4;
	}
	.person-count {
		margin-top: 6px;
		color: var(--accent);
		font-weight: 560;
	}
	.empty h3 {
		margin-bottom: 8px;
	}
	@media (max-width: 720px) {
		.fgrow {
			flex-direction: column;
			align-items: stretch;
		}
		.fcol {
			flex: 1 1 auto;
		}
		.fbtn .btn {
			width: 100%;
		}
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
