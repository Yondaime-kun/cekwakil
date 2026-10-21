<script lang="ts">
	import { fmtRelative } from '#lib/utils';

	let { data, form } = $props();
	const belum = $derived(data.belum as Array<Record<string, unknown>>);
	const laporan = $derived(data.laporan as Array<Record<string, unknown>>);
	const stat = $derived(data.stat as Record<string, number>);
</script>

<svelte:head>
	<title>Tinjau kontribusi - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section">
	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Komunitas</p>
			<h1>Tinjau kontribusi</h1>
			<p class="sub muted">
				Tidak perlu akun atau izin admin. Cek entri terhadap sumbernya, lalu tanda sebagai sudah
				diperiksa atau tarik kalau terbukti keliru. Semua tindakan tercatat di riwayat.
			</p>
		</div>
	</header>

	<div class="stats">
		<a class="stat" href="?tab=belum" class:aktif={data.tab === 'belum'}>
			<span class="n num">{stat.belum}</span><span class="l">Belum diverifikasi</span>
		</a>
		<a class="stat" href="?tab=laporan" class:aktif={data.tab === 'laporan'}>
			<span class="n num">{stat.laporan}</span><span class="l">Laporan terbuka</span>
		</a>
		<div class="stat">
			<span class="n num">{stat.tindakan}</span><span class="l">Tindakan komunitas</span>
		</div>
	</div>

	{#if form?.message}
		<p class="notice notice-info tiny" role="status">{form.message}</p>
	{/if}

	<div class="atur">
		<p class="tiny muted">
			Patokan meninjau: (1) kutipannya ada persis di sumber, (2) konteksnya tidak menyesatkan,
			(3) tanggalnya cocok dengan artikel. Ragu? Biarkan untuk orang lain.
		</p>
		<label class="mini">
			<span class="tiny muted">Nama kamu (opsional)</span>
			<input class="input" name="oleh" form="oleh-form" placeholder="tercatat di riwayat" />
		</label>
	</div>

	<form id="oleh-form" hidden></form>

	{#if data.tab === 'laporan'}
		{#if laporan.length === 0}
			<div class="card empty"><p class="small muted">Tidak ada laporan terbuka. Bagus. ✨</p></div>
		{:else}
			<ul class="antre">
				{#each laporan as l (l.id)}
					<li class="card item">
						<p class="meta tiny muted">
							Laporan #{l.id} · {fmtRelative(String(l.created_at))} · entri
							<a href={`/pejabat/${l.slug}#p-${l.pernyataan_id}`}>#{l.pernyataan_id}</a>
						</p>
						<blockquote>{l.alasan}</blockquote>
						<p class="tiny muted">Kutipan: “{String(l.isi).slice(0, 220)}”</p>
						<div class="row">
							<form method="POST" action="?/tarik" class="tarik">
								<input type="hidden" name="id" value={l.pernyataan_id} />
								<input type="hidden" name="alasan" value={String(l.alasan)} />
								<input
									class="input"
									name="oleh"
									placeholder="Nama kamu (opsional)"
									aria-label="Nama kamu"
								/>
								<button class="btn btn-sm btn-danger" type="submit">Tarik entri</button>
							</form>
							<form method="POST" action="?/tutup">
								<input type="hidden" name="id" value={l.id} />
								<button class="btn btn-sm btn-secondary" type="submit">Tidak berdasar</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		{#if belum.length === 0}
			<div class="card empty">
				<p class="small muted">
					Semua entri sudah diverifikasi. Entri baru akan muncul di sini.
				</p>
			</div>
		{:else}
			<ul class="antre">
				{#each belum as p (p.id)}
					<li class="card item">
						<p class="meta tiny muted">
							<a href={`/pejabat/${p.slug}`}>{p.nama}</a> · entri #{p.id} ·
							{fmtRelative(String(p.created_at))}
						</p>
						<blockquote>{p.isi}</blockquote>
						{#if p.konteks}<p class="tiny muted">{p.konteks}</p>{/if}
						<div class="row">
							<a class="btn btn-sm btn-secondary" href={String(p.sumber_url)} target="_blank" rel="noopener noreferrer"
								>Buka sumber ↗</a
							>
							<form method="POST" action="?/verifikasi" class="verif">
								<input type="hidden" name="id" value={p.id} />
								<input class="input" name="oleh" placeholder="Nama kamu (opsional)" aria-label="Nama kamu" />
								<button class="btn btn-sm" type="submit">Sudah sesuai sumber</button>
							</form>
							<details class="tarikwrap">
								<summary class="tiny">Tarik entri</summary>
								<form method="POST" action="?/tarik" class="tarik">
									<input type="hidden" name="id" value={p.id} />
									<input
										class="input"
										name="alasan"
										required
										minlength="10"
										placeholder="Alasan (min. 10 karakter) — tercatat permanen"
									/>
									<button class="btn btn-sm btn-danger" type="submit">Tarik</button>
								</form>
							</details>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>

<style>
	.pagehead {
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
		max-width: 68ch;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		margin-bottom: 16px;
	}
	.stat {
		display: flex;
		flex-direction: column;
		padding: 12px 20px;
		border-left: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}
	.stat:first-child {
		border-left: none;
		padding-left: 0;
	}
	.stat.aktif .n {
		color: var(--accent);
	}
	a.stat:hover {
		text-decoration: none;
		background: var(--n-50);
	}
	.n {
		font-size: 24px;
		font-weight: 660;
		line-height: 1.15;
	}
	.l {
		font-size: 12.5px;
		color: var(--text-2);
	}
	.atur {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 18px;
	}
	.atur p {
		margin: 0;
		max-width: 52ch;
	}
	.mini {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.mini .input {
		min-height: 34px;
		padding: 4px 10px;
		font-size: 13.5px;
		width: 200px;
	}
	.antre {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.item {
		padding: 16px 18px;
	}
	.meta {
		margin: 0 0 8px;
	}
	blockquote {
		margin: 0 0 8px;
		padding-left: 12px;
		border-left: 2px solid var(--accent-line);
		font-size: 15.5px;
		line-height: 1.6;
	}
	.row {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}
	.verif,
	.tarik {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}
	.verif .input,
	.tarik .input {
		min-height: 34px;
		padding: 4px 10px;
		font-size: 13.5px;
		width: 190px;
	}
	.tarikwrap summary {
		cursor: pointer;
		color: var(--text-2);
		padding: 6px 0;
	}
	.tarikwrap .tarik {
		margin-top: 6px;
	}
	.tarikwrap .tarik .input {
		width: 260px;
	}
	.empty {
		text-align: center;
	}
	@media (max-width: 640px) {
		.stats {
			grid-template-columns: 1fr;
		}
		.stat {
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
			border-left: none;
			border-top: 1px solid var(--line);
			padding: 10px 0;
		}
		.stat:first-child {
			border-top: none;
		}
		.mini .input,
		.verif .input,
		.tarik .input,
		.tarikwrap .tarik .input {
			width: 100%;
		}
		.verif,
		.tarikwrap {
			width: 100%;
		}
	}
</style>
