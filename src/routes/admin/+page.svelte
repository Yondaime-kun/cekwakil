<script lang="ts">
	import ConfirmButton from '#lib/components/ConfirmButton.svelte';
	import { fmtRelative } from '#lib/utils';

	let { data, form } = $props();
	const auth = $derived(data.auth as boolean);
	const terbaru = $derived(data.terbaru as Array<Record<string, unknown>>);
	const dilaporkan = $derived(data.dilaporkan as Array<Record<string, unknown>>);
	const dibatalkan = $derived(data.dibatalkan as Array<Record<string, unknown>>);

	// Laporan yang sudah ditutup tidak perlu mengganggu; default ke yang terbuka.
	const laporanTerbuka = $derived(dilaporkan.filter((l) => l.status !== 'selesai'));
	const laporanSelesai = $derived(dilaporkan.filter((l) => l.status === 'selesai'));

	// Buka tab laporan kalau ada yang perlu ditindak — itu pekerjaan utamanya.
	let tab = $state<'terbaru' | 'laporan' | 'ditarik' | 'impor'>('terbaru');
	$effect(() => {
		if (laporanTerbuka.length > 0) tab = 'laporan';
	});
	let lihatSelesai = $state(false);

	const tabs = $derived([
		{ id: 'laporan' as const, label: 'Dilaporkan', n: laporanTerbuka.length, urgent: laporanTerbuka.length > 0 },
		{ id: 'terbaru' as const, label: 'Terbaru', n: terbaru.length },
		{ id: 'ditarik' as const, label: 'Ditarik', n: dibatalkan.length },
		{ id: 'impor' as const, label: 'Impor', n: null }
	]);
</script>

<svelte:head>
	<title>Moderasi - CekWakil</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="container section">
	{#if !auth}
		<div class="narrow">
			<h1>Moderasi</h1>
			<p class="small muted intro">
				Masuk dengan token admin untuk meninjau entri publik. Sesi berlaku 12 jam dan hanya untuk
				path ini.
			</p>
			<form method="POST" action="?/login" class="card login">
				<div class="fgroup">
					<label class="label" for="token">Token admin</label>
					<input
						class="input"
						id="token"
						name="token"
						type="password"
						required
						autocomplete="current-password"
					/>
				</div>
				{#if form?.wrong}
					<p class="notice notice-error tiny" role="alert">Token salah. Coba lagi.</p>
				{/if}
				<button class="btn" type="submit">Masuk</button>
			</form>
		</div>
	{:else}
		<div class="toprow">
			<div>
				<p class="crumb tiny muted">Admin</p>
				<h1>Moderasi</h1>
				<p class="small muted count">
					<strong class="num">{data.pernyataan}</strong> entri tayang ·
					<strong class="num">{data.total}</strong> pejabat ·
					<strong class="num">{data.kandidat}</strong> sumber belum diarsipkan
				</p>
			</div>
			<form method="POST" action="?/logout">
				<button class="btn btn-secondary btn-sm" type="submit">Keluar</button>
			</form>
		</div>

		{#if form?.message || form?.wrong}
			<div class="notice notice-info" role="status">
				<p class="small">{form?.message ?? 'Aksi tidak diizinkan. Silakan masuk ulang.'}</p>
			</div>
		{/if}

		<div class="tabs" role="tablist" aria-label="Bagian moderasi">
			{#each tabs as t (t.id)}
				<button
					role="tab"
					id={`tab-${t.id}`}
					aria-selected={tab === t.id}
					aria-controls={`panel-${t.id}`}
					class:active={tab === t.id}
					onclick={() => (tab = t.id)}
				>
					{t.label}{#if t.n !== null}<span class="tabn num" class:urgent={t.urgent}>{t.n}</span>{/if}
				</button>
			{/each}
		</div>

		<div id="panel-laporan" role="tabpanel" aria-labelledby="tab-laporan" hidden={tab !== 'laporan'}>
			{#if dilaporkan.length === 0}
				<div class="card empty"><p class="small muted">Tidak ada laporan masuk. Bersih. ✨</p></div>
			{:else}
				<ul class="entries">
					{#each lihatSelesai ? dilaporkan : laporanTerbuka as l (l.id)}
						<li class="card entry">
							<div class="entry-head">
								<span class="entry-name">
									Laporan #{l.id}
									{#if l.status === 'terbuka'}
										<span class="status status-warning">terbuka</span>
									{:else}
										<span class="status status-success">selesai</span>
									{/if}
								</span>
								<span class="tiny muted">
									entri <a href={`/blunder`}>#{l.pernyataan_id}</a> ·
									{fmtRelative(String(l.created_at))}
								</span>
							</div>
							<blockquote>{l.alasan}</blockquote>
							{#if l.status === 'terbuka'}
								<div class="inline">
									<form method="POST" action="?/revert">
										<input type="hidden" name="id" value={l.pernyataan_id} />
										<input type="hidden" name="alasan" value={l.alasan} />
										<ConfirmButton label="Tarik entri" pesan="Yakin tarik?" />
									</form>
									<form method="POST" action="?/tutupLaporan">
										<input type="hidden" name="id" value={l.id} />
										<button class="btn btn-sm btn-secondary" type="submit">Tandai selesai</button>
									</form>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
				{#if laporanSelesai.length > 0}
					<button class="more" type="button" onclick={() => (lihatSelesai = !lihatSelesai)}>
						{lihatSelesai ? 'Sembunyikan yang selesai' : `Lihat ${laporanSelesai.length} laporan selesai`}
					</button>
				{/if}
			{/if}
		</div>

		<div id="panel-terbaru" role="tabpanel" aria-labelledby="tab-terbaru" hidden={tab !== 'terbaru'}>
			{#if terbaru.length === 0}
				<div class="card"><p class="small muted">Belum ada entri tayang.</p></div>
			{:else}
				<ul class="entries">
					{#each terbaru as p (p.id)}
						<li class="card entry">
							<div class="entry-head">
								<span class="entry-name">
									<a href={`/pejabat/${p.slug}`}>{p.nama ?? '—'}</a>
								</span>
								<span class="tiny muted">#{p.id} · {p.kategori} · {p.tanggal}</span>
							</div>
							<blockquote>{(p.isi as string).slice(0, 400)}</blockquote>
							<form method="POST" action="?/revert" class="inline">
								<input type="hidden" name="id" value={p.id} />
								<input class="input" name="alasan" placeholder="Alasan tarik (opsional)" />
								<ConfirmButton label="Tarik" pesan="Yakin tarik?" />
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div id="panel-ditarik" role="tabpanel" aria-labelledby="tab-ditarik" hidden={tab !== 'ditarik'}>
			{#if dibatalkan.length === 0}
				<div class="card"><p class="small muted">Belum ada entri ditarik.</p></div>
			{:else}
				<ul class="entries">
					{#each dibatalkan as p (p.id)}
						<li class="card entry">
							<div class="entry-head">
								<span class="entry-name">{p.nama ?? '—'}</span>
								<span class="tiny muted">#{p.id} · ditarik {fmtRelative(String(p.reverted_at))}</span>
							</div>
							<blockquote>{(p.isi as string).slice(0, 300)}</blockquote>
							<p class="tiny reason">Alasan: {p.revert_reason ?? '—'}</p>
							<form method="POST" action="?/pulihkan">
								<input type="hidden" name="id" value={p.id} />
								<button class="btn btn-sm btn-secondary" type="submit">Pulihkan</button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div id="panel-impor" role="tabpanel" aria-labelledby="tab-impor" hidden={tab !== 'impor'}>
			<div class="card">
				<h2 class="imporhead">Impor data</h2>
				<p class="small muted">
					Unggah berkas JSON hasil <a href="/api/export?format=json" target="_blank" rel="noopener"
						>export CekWakil</a
					>, atau tempel URL export dari mirror lain. Entri duplikat (isi + tanggal + pejabat sama)
					dilewati otomatis.
				</p>
				<form method="POST" action="?/import" enctype="multipart/form-data" class="importform">
					<div class="fgroup">
						<label class="label" for="berkas">Berkas JSON</label>
						<input class="input" id="berkas" name="berkas" type="file" accept=".json,application/json" />
					</div>
					<p class="tiny muted or">atau</p>
					<div class="fgroup">
						<label class="label" for="dari_url">URL export</label>
						<input
							class="input"
							id="dari_url"
							name="dari_url"
							type="url"
							placeholder="https://mirror.example/api/export?format=json"
						/>
					</div>
					<button class="btn" type="submit">Impor</button>
				</form>
			</div>
		</div>
	{/if}
</section>

<style>
	.narrow {
		max-width: 420px;
	}
	.intro {
		margin: 8px 0 14px;
	}
	.login {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 20px;
	}
	.crumb {
		margin: 0 0 4px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-weight: 600;
	}
	.toprow {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-wrap: wrap;
	}
	.count {
		margin-top: 4px;
	}
	.tabs {
		display: flex;
		gap: 4px;
		margin: 20px 0;
		flex-wrap: wrap;
		border-bottom: 1px solid var(--line);
	}
	.tabs button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 9px 14px;
		margin-bottom: -1px;
		border: none;
		border-bottom: 2px solid transparent;
		background: none;
		font: inherit;
		font-size: 13.5px;
		font-weight: 550;
		color: var(--text-2);
		cursor: pointer;
	}
	.tabs button:hover {
		color: var(--text);
	}
	.tabs button.active {
		color: var(--text);
		font-weight: 650;
		border-bottom-color: var(--accent);
	}
	.tabn {
		font-size: 11px;
		padding: 0 6px;
		border-radius: var(--radius-pill);
		background: var(--n-100);
		color: var(--text-2);
	}
	.tabn.urgent {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.entry-head {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}
	.entry-name {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 15.5px;
		font-weight: 620;
	}
	blockquote {
		margin: 0 0 10px;
		padding-left: 14px;
		border-left: 2px solid var(--accent-line);
		font-size: 15px;
		line-height: 1.6;
	}
	.reason {
		margin: -4px 0 10px;
		color: var(--text-2);
	}
	.inline {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}
	.inline .input {
		flex: 1 1 200px;
		min-width: 0;
	}
	.more {
		margin-top: 14px;
		border: none;
		background: none;
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		cursor: pointer;
		text-decoration: underline;
	}
	.imporhead {
		font-size: 17px;
		margin-bottom: 8px;
	}
	.importform {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 16px;
	}
	.importform .btn {
		width: 100%;
	}
	.or {
		text-align: center;
		margin: 0;
	}
	.empty {
		text-align: center;
	}
	[role='tabpanel'][hidden] {
		display: none;
	}
	@media (max-width: 560px) {
		.toprow {
			flex-direction: column;
		}
		.inline .input {
			flex: 1 1 100%;
		}
		.inline .btn {
			flex: 1 1 auto;
		}
		.tabs button {
			flex: 1 1 auto;
			justify-content: center;
		}
	}
</style>
