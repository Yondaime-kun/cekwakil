<script lang="ts">
	import Pagination from '#lib/components/Pagination.svelte';
	import PejabatAvatar from '#lib/components/PejabatAvatar.svelte';
	import { page } from '$app/state';
	import { withParams } from '#lib/utils';

	let { data } = $props();

	const rows = $derived(
		data.rows as Array<{
			id: number;
			nama: string;
			slug: string;
			jabatan: string;
			partai: string | null;
			komisi: string | null;
			dapil: string | null;
			foto_url: string | null;
			jumlah_kutipan: number;
			skor: number;
			kosong: string[];
		}>
	);
	const ringkas = $derived(data.ringkas as {
		total: number;
		tanpaFoto: number;
		tanpaKutipan: number;
		tanpaKomisi: number;
		tanpaBio: number;
		rataRata: number;
	});
	const params = $derived(page.url.searchParams);
	const totalPages = $derived(Math.max(1, Math.ceil((data.total as number) / (data.perPage as number))));

	const fokusList = [
		{ v: '', l: 'Semua kolom' },
		{ v: 'kutipan', l: 'Belum ada kutipan' },
		{ v: 'foto', l: 'Belum ada foto' },
		{ v: 'komisi', l: 'Komisi kosong' },
		{ v: 'bio', l: 'Bio kosong' },
		{ v: 'dapil', l: 'Dapil kosong' },
		{ v: 'suara', l: 'Suara kosong' }
	];

	function href(changes: Record<string, string | number | null>) {
		return `/lengkapi${withParams(params, changes)}`;
	}

	function nada(skor: number): string {
		if (skor >= 85) return 'status-ok';
		if (skor >= 55) return 'status-warn';
		return 'status-error';
	}
</script>

<svelte:head>
	<title>Lengkapi data - CekWakil</title>
	<meta
		name="description"
		content="Daftar kerja kontributor: profil pejabat yang datanya masih bolong, diurutkan dari yang paling kurang."
	/>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<section class="container section">
	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Kontribusi</p>
			<h1>Lengkapi data</h1>
			<p class="sub muted">
				<strong class="num">{ringkas.total.toLocaleString('id-ID')}</strong> profil · rata-rata terisi
				<strong class="num">{ringkas.rataRata}%</strong>. Kamu bisa isi satu kolom saja — tidak harus
				semua.
			</p>
		</div>
	</header>

	<ul class="stat">
		<li>
			<a
				class="card statcard"
				class:on={data.fokus === 'kutipan'}
				href={href({ fokus: 'kutipan', page: null })}
			>
				<span class="n num">{ringkas.tanpaKutipan.toLocaleString('id-ID')}</span>
				<span class="l">belum ada kutipan</span>
			</a>
		</li>
		<li>
			<a
				class="card statcard"
				class:on={data.fokus === 'foto'}
				href={href({ fokus: 'foto', page: null })}
			>
				<span class="n num">{ringkas.tanpaFoto.toLocaleString('id-ID')}</span>
				<span class="l">belum ada foto</span>
			</a>
		</li>
		<li>
			<a
				class="card statcard"
				class:on={data.fokus === 'komisi'}
				href={href({ fokus: 'komisi', page: null })}
			>
				<span class="n num">{ringkas.tanpaKomisi.toLocaleString('id-ID')}</span>
				<span class="l">komisi kosong</span>
			</a>
		</li>
		<li>
			<a
				class="card statcard"
				class:on={data.fokus === 'bio'}
				href={href({ fokus: 'bio', page: null })}
			>
				<span class="n num">{ringkas.tanpaBio.toLocaleString('id-ID')}</span>
				<span class="l">bio kosong</span>
			</a>
		</li>
	</ul>

	<div class="filterbar">
		<div class="chips" role="group" aria-label="Pilih kolom yang kosong">
			{#each fokusList as f (f.v)}
				<a class="chip" class:on={data.fokus === f.v} href={href({ fokus: f.v || null, page: null })}
					>{f.l}</a
				>
			{/each}
		</div>
	</div>

	{#if rows.length === 0}
		<div class="card empty">
			<p class="small">
				<strong>Semua sudah terisi.</strong> Tidak ada profil yang cocok dengan filter ini.
			</p>
			<a class="btn btn-secondary btn-sm" href="/lengkapi">Lihat semua</a>
		</div>
	{:else}
		<ul class="daftar">
			{#each rows as r (r.id)}
				<li class="baris">
					<PejabatAvatar nama={r.nama} foto={r.foto_url} ukuran={40} />
					<div class="id">
						<a class="nm" href={`/pejabat/${r.slug}`}>{r.nama}</a>
						<p class="meta tiny muted">
							{r.jabatan}{#if r.partai} · {r.partai}{/if}{#if r.komisi} · {r.komisi}{/if}
						</p>
					</div>

					<div class="isi">
						<div class="meter" aria-hidden="true"><span style={`width:${r.skor}%`}></span></div>
						<span class="status {nada(r.skor)} num">{r.skor}%</span>
					</div>

					<div class="kosong">
						{#each r.kosong.slice(0, 3) as k (k)}
							<span class="tag">{k}</span>
						{/each}
						{#if r.kosong.length > 3}<span class="tag more">+{r.kosong.length - 3}</span>{/if}
					</div>

					<div class="aksi">
						{#if r.jumlah_kutipan === 0}
							<a class="btn btn-secondary btn-sm" href={`/submit?pejabat=${r.slug}`}>+ Kutipan</a>
						{/if}
						<a class="btn btn-secondary btn-sm" href={`/pejabat/${r.slug}/edit`}>Sunting</a>
					</div>
				</li>
			{/each}
		</ul>

		<Pagination current={data.halaman as number} total={totalPages} />
	{/if}
</section>

<style>
	.pagehead {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		padding-bottom: 20px;
		margin-bottom: 22px;
		border-bottom: 1px solid var(--line);
	}
	h1 {
		margin: 4px 0 0;
		font-size: clamp(30px, 4vw, 44px);
		font-weight: 660;
		letter-spacing: -0.035em;
	}
	.sub {
		margin: 8px 0 0;
		font-size: 14.5px;
		max-width: 62ch;
	}

	.stat {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 10px;
		margin: 0 0 18px;
		padding: 0;
	}
	/* .card menyediakan border/radius/shadow; di sini hanya yang berbeda. */
	.statcard {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 14px 16px;
		text-decoration: none;
		color: inherit;
		transition: border-color 140ms var(--ease);
	}
	.statcard:hover {
		border-color: var(--line-strong);
		text-decoration: none;
	}
	.statcard.on {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.stat .n {
		font-size: 24px;
		font-weight: 660;
		letter-spacing: -0.02em;
	}
	.stat .l {
		font-size: 12px;
		color: var(--text-3);
	}

	/* Sama seperti .frow di /pejabat & /blunder: di layar sempit baris filter
	   bisa digeser, tapi scrollbar-nya disembunyikan supaya tidak memotong
	   layout. Di desktop chip cukup wrap seperti biasa. */
	.filterbar {
		margin-bottom: 16px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}
	.chip.on {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}

	.daftar {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	.baris {
		display: grid;
		grid-template-columns: 40px minmax(180px, 1.4fr) 150px minmax(140px, 1fr) auto;
		align-items: center;
		gap: 14px;
		padding: 12px 4px;
		border-bottom: 1px solid var(--line);
	}
	.id {
		min-width: 0;
	}
	.nm {
		font-size: 14.5px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.nm:hover {
		color: var(--accent);
		text-decoration: underline;
	}
	.meta {
		margin: 2px 0 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.isi {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.meter {
		flex: 1;
		height: 5px;
		border-radius: var(--radius-pill);
		background: var(--n-100);
		overflow: hidden;
	}
	.meter span {
		display: block;
		height: 100%;
		background: var(--accent);
	}

	.kosong {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.tag {
		font-size: 11px;
		padding: 2px 7px;
		border-radius: var(--radius-pill);
		background: var(--n-50);
		border: 1px solid var(--line);
		color: var(--text-3);
		white-space: nowrap;
	}
	.tag.more {
		color: var(--text-3);
		border-style: dashed;
	}

	.aksi {
		display: flex;
		gap: 6px;
		justify-content: flex-end;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 20px;
	}

	@media (max-width: 720px) {
		.filterbar {
			overflow-x: auto;
			scrollbar-width: none;
			margin-right: -20px;
			padding-right: 20px;
			padding-bottom: 2px;
		}
		.filterbar::-webkit-scrollbar {
			display: none;
		}
		.chips {
			flex-wrap: nowrap;
			min-width: max-content;
		}
	}

	@media (max-width: 900px) {
		.stat {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.baris {
			grid-template-columns: 40px 1fr auto;
			row-gap: 8px;
		}
		.isi {
			grid-column: 2 / 3;
		}
		.kosong {
			grid-column: 2 / 4;
		}
		.aksi {
			grid-column: 2 / 4;
			justify-content: flex-start;
		}
	}
</style>
