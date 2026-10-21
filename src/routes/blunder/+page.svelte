<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import EntryCard from '#lib/components/EntryCard.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import Select from '#lib/components/Select.svelte';
	import { withParams } from '#lib/utils';

	let { data } = $props();
	const rows = $derived(data.rows as Array<Record<string, unknown>>);
	const totalPages = $derived(Math.max(1, Math.ceil((data.total as number) / (data.perPage as number))));

	// Filter disalin dari URL -> diubah -> jadi href. Semua kontrol filter
	// adalah <a>, jadi bisa dibuka di tab baru dan tahan refresh.
	const params = $derived(page.url.searchParams);
	const adaFilter = $derived(!!(data.q || data.kategori || data.partai || data.tag));

	let q = $state('');
	// Nilai input disinkronkan kalau user menekan Back dan data berubah.
	$effect(() => {
		q = data.q;
	});

	function href(changes: Record<string, string | number | null>) {
		return `/blunder${withParams(params, changes)}`;
	}

	function submitCari(e: SubmitEvent) {
		e.preventDefault();
		goto(href({ q: q.trim() || null }));
	}

	const urutList = [
		{ v: 'baru', l: 'Terbaru' },
		{ v: 'lama', l: 'Terlama' },
		{ v: 'dikutip', l: 'Baru diarsipkan' }
	] as const;
</script>

<svelte:head>
	<title>{data.q ? `“${data.q}” — ` : ''}Arsip pernyataan - CekWakil</title>
	<meta
		name="description"
		content="Arsip kutipan pernyataan pejabat publik Indonesia dengan tanggal, konteks, dan tautan sumber berita yang diarsipkan."
	/>
</svelte:head>

<section class="container section">
	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Arsip</p>
			<h1>Pernyataan terarsip</h1>
			<p class="sub muted">
				<strong class="num">{data.total.toLocaleString('id-ID')}</strong>
				{adaFilter ? 'hasil' : 'entri'}
				{#if data.q}untuk “{data.q}”{/if}
				{#if data.kategori}· kategori {data.kategori}{/if}
				{#if data.partai}· {data.partai}{/if}
				{#if data.tag}· tag #{data.tag}{/if}
			</p>
		</div>
		<a href="/submit" class="btn btn-sm btn-block-mobile">+ Lapor pernyataan</a>
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
			placeholder="Cari kata dalam kutipan, nama, atau dapil…"
			aria-label="Cari di arsip"
			autocomplete="off"
		/>
		<button class="btn btn-sm" type="submit">Cari</button>
	</form>

	<div class="filters">
		<div class="frow" role="group" aria-label="Filter kategori">
			<a class="chip" class:chip-active={!data.kategori} href={href({ kategori: null })}>Semua</a>
			{#each data.kategoris as k (k.kategori)}
				<a
					class="chip"
					class:chip-active={data.kategori === k.kategori}
					href={href({ kategori: data.kategori === k.kategori ? null : k.kategori })}>
					{k.kategori}<span class="cnt num">{k.c}</span>
				</a>
			{/each}
		</div>

		{#if data.tags.length > 0}
			<div class="frow" role="group" aria-label="Filter tag">
				{#each data.tags as t (t.slug)}
					<a
						class="chip tagchip"
						class:chip-active={data.tag === t.slug}
						href={href({ tag: data.tag === t.slug ? null : t.slug })}
						>#{t.slug}<span class="cnt num">{t.c}</span></a
					>
				{/each}
			</div>
		{/if}
		<div class="frow2">
			<Select
				label="Partai"
				ariaLabel="Filter partai"
				value={data.partai}
				options={[{ value: '', label: 'Semua' }, ...data.partais.map((p) => ({ value: p.partai, label: p.partai, hint: String(p.c) }))]}
				onchange={(v) => goto(href({ partai: v || null }))}
			/>
			<Select
				label="Urutkan"
				ariaLabel="Urutkan arsip"
				value={data.urut}
				options={urutList.map((u) => ({ value: u.v, label: u.l }))}
				onchange={(v) => goto(href({ urut: v }))}
			/>
			{#if adaFilter}
				<a class="reset" href="/blunder">Reset filter</a>
			{/if}
		</div>
	</div>

	{#if rows.length === 0}
		<div class="card empty">
			{#if adaFilter}
				<h3>Tidak ada yang cocok</h3>
				<p class="small muted">
					Coba kata kunci yang lebih pendek, atau lepas filternya. Kalau kamu tahu pernyataan yang
					belum tercatat, langsung tambahkan.
				</p>
				<p class="btnrow">
					<a href="/blunder" class="btn btn-secondary btn-sm">Hapus filter</a>
					<a href="/submit" class="btn btn-sm">Lapor pernyataan</a>
				</p>
			{:else}
				<h3>Arsip masih kosong</h3>
				<p class="small muted">
					Arsip ini diisi publik. Kalau kamu punya kutipan yang layak dicatat, sertakan sumbernya.
				</p>
				<p><a href="/submit" class="btn btn-sm">Lapor pernyataan pertama</a></p>
			{/if}
		</div>
	{:else}
		<ul class="entries">
			{#each rows as r, i (r.id)}
				<li>
					<EntryCard
						e={r}
						sumber={data.sumberMap[r.id as number] ?? []}
						tampilkanNama={true}
						q={data.q}
						nomor={((data.page as number) - 1) * (data.perPage as number) + i + 1}
					/>
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
		margin-bottom: 22px;
	}
	.frow {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.frow .chip {
		cursor: pointer;
	}
	.tagchip {
		font-family: ui-monospace, monospace;
		font-size: 11.5px;
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
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
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
		.pagehead {
			gap: 12px;
		}
		.frow {
			flex-wrap: nowrap;
			overflow-x: auto;
			scrollbar-width: none;
			padding-bottom: 2px;
			margin-right: -20px;
			padding-right: 20px;
		}
		.frow::-webkit-scrollbar {
			display: none;
		}
	}
</style>
