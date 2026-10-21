<script lang="ts">
	import { goto, preloadData } from '$app/navigation';
	import { page } from '$app/state';
	import Pagination from '#lib/components/Pagination.svelte';
	import Select from '#lib/components/Select.svelte';
	import { withParams } from '#lib/utils';

	let { data } = $props();
	const rows = $derived(data.rows as Array<Record<string, unknown>>);
	const totalPages = $derived(Math.max(1, Math.ceil((data.total as number) / (data.perPage as number))));
	const params = $derived(page.url.searchParams);
	const adaFilter = $derived(!!(data.q || data.partai || data.instansi));

	let q = $state('');
	// Sinkron kalau user menekan Back.
	$effect(() => {
		q = data.q;
	});

	function href(changes: Record<string, string | number | null>) {
		return `/pejabat${withParams(params, changes)}`;
	}

	function submitCari(e: SubmitEvent) {
		e.preventDefault();
		goto(href({ q: q.trim() || null }));
	}

	const urutList = [
		{ v: 'nama', l: 'Nama A–Z' },
		{ v: 'kutipan', l: 'Paling banyak kutipan' },
		{ v: 'suara', l: 'Perolehan suara' }
	] as const;

	// Prefetch profil saat kursor berhenti di kartu (desktop saja).
	function hover(slug: string) {
		if (window.matchMedia('(hover: hover)').matches) {
			preloadData(`/pejabat/${slug}`);
		}
	}
</script>

<svelte:head>
	<title>{data.q ? `Cari “${data.q}” — ` : ''}Pejabat - CekWakil</title>
	<meta
		name="description"
		content="Profil anggota DPR RI 2024-2029 dan pejabat negara: partai, dapil, komisi, perolehan suara, dan arsip kutipannya."
	/>
</svelte:head>

<section class="container section">
	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Direktori</p>
			<h1>Pejabat</h1>
			<p class="sub muted">
				<strong class="num">{data.total.toLocaleString('id-ID')}</strong>
				{adaFilter ? 'hasil' : 'profil'} · DPR RI 2024–2029 & Kabinet Merah Putih
			</p>
		</div>
		<a href="/pejabat/tambah" class="btn btn-sm btn-secondary btn-block-mobile">+ Tambah pejabat</a>
	</header>

	<form class="searchbar" onsubmit={submitCari} role="search">
		<svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17">
			<circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
			<path d="m13 13 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
		</svg>
		<input
			class="qfield"
			type="search"
			name="q"
			bind:value={q}
			placeholder="Nama, dapil, atau komisi (contoh: Jakarta, Komisi XI)…"
			aria-label="Cari pejabat"
			autocomplete="off"
		/>
		<button class="btn btn-sm" type="submit">Cari</button>
	</form>

	<div class="filters">
		<div class="frow" role="group" aria-label="Filter partai">
			<a class="chip" class:chip-active={!data.partai} href={href({ partai: null })}>Semua partai</a>
			{#each data.partais as p (p.partai)}
				<a
					class="chip"
					class:chip-active={data.partai === p.partai}
					href={href({ partai: data.partai === p.partai ? null : p.partai })}
					>{p.partai}<span class="cnt num">{p.c}</span></a
				>
			{/each}
		</div>
		<div class="frow2">
			{#if data.instansis.length > 1}
				<Select
					label="Lembaga"
					ariaLabel="Filter lembaga"
					value={data.instansi}
					options={[{ value: '', label: 'Semua' }, ...data.instansis.map((i) => ({ value: i.instansi, label: i.instansi, hint: String(i.c) }))]}
					onchange={(v) => goto(href({ instansi: v || null }))}
				/>
			{/if}
			<Select
				label="Urutkan"
				ariaLabel="Urutkan pejabat"
				value={data.urut}
				options={urutList.map((u) => ({ value: u.v, label: u.l }))}
				onchange={(v) => goto(href({ urut: v }))}
			/>
			{#if adaFilter}
				<a class="reset" href="/pejabat">Reset filter</a>
			{/if}
		</div>
	</div>

	{#if rows.length === 0}
		<div class="card empty">
			<h3>Tidak ada yang cocok</h3>
			<p class="small muted">
				Coba nama tanpa gelar, atau cari pakai dapil. Kalau pejabatnya memang belum ada di daftar,
				tambahkan profilnya.
			</p>
			<p class="btnrow">
				<a href="/pejabat" class="btn btn-secondary btn-sm">Hapus filter</a>
				<a href="/pejabat/tambah" class="btn btn-sm">Tambah pejabat</a>
			</p>
		</div>
	{:else}
		<ul class="grid">
			{#each rows as r, i (r.id)}
				<li>
					<a class="person" href={`/pejabat/${r.slug}`} onmouseenter={() => hover(String(r.slug))}>
						<span class="ptop">
							<span class="person-name">{r.nama}</span>
							{#if Number(r.jumlah) > 0}
								<span class="badge num" title={`${r.jumlah} kutipan terarsip`}>{r.jumlah}</span>
							{:else}
								<span class="badge ghost" title="Belum ada kutipan">0</span>
							{/if}
						</span>
						<span class="person-meta tiny muted">
							{r.jabatan}{r.partai ? ` · ${r.partai}` : ''}
						</span>
						{#if r.dapil || r.komisi}
							<span class="person-tags">
								{#if r.komisi}<span class="tag">{r.komisi}</span>{/if}
								{#if r.dapil}<span class="tag">{r.dapil}</span>{/if}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		{#if totalPages > 1}
			<Pagination current={data.page} total={totalPages} />
		{/if}
	{/if}
</section>

<style>
	.pagehead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 18px;
	}
	.crumb {
		margin: 0 0 6px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-weight: 600;
	}
	.sub {
		margin: 6px 0 0;
		font-size: 14px;
	}
	.searchbar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 5px 5px 12px;
		background: var(--surface);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-lg);
		margin-bottom: 14px;
		transition:
			border-color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}
	.searchbar:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.searchbar svg {
		color: var(--text-3);
		flex: 0 0 auto;
	}
	.qfield {
		flex: 1 1 auto;
		min-width: 0;
		border: none;
		background: none;
		padding: 6px 0;
		font: inherit;
		font-size: 15px;
		color: var(--text);
		outline: none;
	}
	.qfield::placeholder {
		color: var(--text-3);
	}
	.filters {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}
	.frow {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cnt {
		font-size: 10.5px;
		color: var(--text-3);
		margin-left: 2px;
	}
	.chip-active .cnt {
		color: var(--accent);
		opacity: 0.75;
	}
	.frow2 {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		flex-wrap: wrap;
	}
	.reset {
		font-size: 13px;
		font-weight: 560;
		align-self: center;
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 10px;
	}
	.person {
		display: flex;
		flex-direction: column;
		gap: 3px;
		height: 100%;
		padding: 13px 15px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition:
			border-color 120ms var(--ease),
			box-shadow 120ms var(--ease),
			transform 120ms var(--ease);
	}
	.person:hover {
		border-color: var(--accent-line);
		box-shadow: var(--shadow-card);
		text-decoration: none;
	}
	.ptop {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}
	.person-name {
		font-size: 15px;
		font-weight: 600;
		line-height: 1.35;
	}
	.person:hover .person-name {
		color: var(--accent);
	}
	.badge {
		flex: 0 0 auto;
		min-width: 22px;
		height: 20px;
		padding: 0 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 11.5px;
		font-weight: 650;
		color: var(--accent);
		background: var(--accent-soft);
		border: 1px solid var(--accent-line);
		border-radius: var(--radius-pill);
	}
	.badge.ghost {
		color: var(--text-3);
		background: transparent;
		border-color: var(--line);
		font-weight: 500;
	}
	.person-meta {
		line-height: 1.4;
	}
	.person-tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		margin-top: 4px;
	}
	.tag {
		font-size: 11px;
		padding: 1px 7px;
		color: var(--text-2);
		background: var(--n-50);
		border: 1px solid var(--line);
		border-radius: 3px;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.empty h3 {
		margin-bottom: 8px;
	}
	.empty p {
		max-width: 54ch;
	}
	.btnrow {
		display: flex;
		gap: 8px;
		margin-top: 14px;
		flex-wrap: wrap;
	}
	@media (max-width: 720px) {
		.frow {
			flex-wrap: nowrap;
			overflow-x: auto;
			scrollbar-width: none;
			margin-right: -20px;
			padding-right: 20px;
			padding-bottom: 2px;
		}
		.frow::-webkit-scrollbar {
			display: none;
		}
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
