<script lang="ts">
	let { data, form } = $props();
	const auth = $derived(data.auth as boolean);
	const terbaru = $derived(data.terbaru as Array<Record<string, unknown>>);
	const dilaporkan = $derived(data.dilaporkan as Array<Record<string, unknown>>);
	const dibatalkan = $derived(data.dibatalkan as Array<Record<string, unknown>>);
	const terbuka = $derived(dilaporkan.filter((l) => l.status === 'terbuka').length);
	let tab = $state<'terbaru' | 'laporan' | 'ditarik' | 'impor'>('terbaru');
</script>

<svelte:head>
	<title>Moderasi - CekWakil</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="container section">
	{#if !auth}
		<div class="narrow">
			<h1>Moderasi</h1>
			<p class="small muted intro">Masuk dengan token admin untuk meninjau entri publik.</p>
			<form method="POST" action="?/login" class="card login">
				<label class="label" for="token">Token admin</label>
				<input class="input" id="token" name="token" type="password" required autocomplete="off" />
				{#if form?.wrong}<p class="small err">Token salah.</p>{/if}
				<button class="btn" type="submit">Masuk</button>
			</form>
		</div>
	{:else}
		<div class="toprow">
			<div>
				<h1>Moderasi</h1>
				<p class="small muted count">
					{data.pernyataan} entri tayang · {data.total} pejabat · {data.kandidat} belum diarsipkan
				</p>
			</div>
			<form method="POST" action="?/logout">
				<button class="btn btn-secondary btn-sm" type="submit">Keluar</button>
			</form>
		</div>

		{#if form?.message}
			<div class="notice notice-info"><p class="small">{form.message}</p></div>
		{/if}

		<nav class="tabs">
			<button class:active={tab === 'terbaru'} onclick={() => (tab = 'terbaru')}>
				Terbaru ({terbaru.length})
			</button>
			<button class:active={tab === 'laporan'} onclick={() => (tab = 'laporan')}>
				Dilaporkan ({terbuka})
			</button>
			<button class:active={tab === 'ditarik'} onclick={() => (tab = 'ditarik')}>
				Ditarik ({dibatalkan.length})
			</button>
			<button class:active={tab === 'impor'} onclick={() => (tab = 'impor')}>Impor</button>
		</nav>

		{#if tab === 'terbaru'}
			{#if terbaru.length === 0}
				<div class="card"><p class="small muted">Belum ada entri tayang.</p></div>
			{:else}
				<ul class="entries">
					{#each terbaru as p (p.id)}
						<li class="card entry">
							<div class="entry-head">
								<span class="entry-name">{p.nama ?? '—'}</span>
								<span class="tiny muted">#{p.id} · {p.kategori} · {p.tanggal}</span>
							</div>
							<blockquote>{(p.isi as string).slice(0, 400)}</blockquote>
							<form method="POST" action="?/revert" class="inline">
								<input type="hidden" name="id" value={p.id} />
								<input class="input" name="alasan" placeholder="Alasan tarik (opsional)" />
								<button class="btn btn-sm btn-danger" type="submit">Tarik</button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}

		{#if tab === 'laporan'}
			{#if dilaporkan.length === 0}
				<div class="card"><p class="small muted">Tidak ada laporan masuk.</p></div>
			{:else}
				<ul class="entries">
					{#each dilaporkan as l (l.id)}
						<li class="card entry">
							<div class="entry-head">
								<span class="entry-name">Laporan #{l.id}</span>
								<span class="tiny muted">entri #{l.pernyataan_id} · {l.status}</span>
							</div>
							<blockquote>{l.alasan}</blockquote>
							{#if l.status === 'terbuka'}
								<div class="inline">
									<form method="POST" action="?/revert">
										<input type="hidden" name="id" value={l.pernyataan_id} />
										<input type="hidden" name="alasan" value={l.alasan} />
										<button class="btn btn-sm btn-danger" type="submit">Tarik entri</button>
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
			{/if}
		{/if}

		{#if tab === 'ditarik'}
			{#if dibatalkan.length === 0}
				<div class="card"><p class="small muted">Belum ada entri ditarik.</p></div>
			{:else}
				<ul class="entries">
					{#each dibatalkan as p (p.id)}
						<li class="card entry">
							<div class="entry-head">
								<span class="entry-name">{p.nama ?? '—'}</span>
								<span class="tiny muted">#{p.id} · {p.reverted_at}</span>
							</div>
							<blockquote>{(p.isi as string).slice(0, 300)}</blockquote>
							<p class="tiny muted">Alasan: {p.revert_reason ?? '—'}</p>
							<form method="POST" action="?/pulihkan">
								<input type="hidden" name="id" value={p.id} />
								<button class="btn btn-sm btn-secondary" type="submit">Pulihkan</button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}

		{#if tab === 'impor'}
			<div class="card entry">
				<h2 class="imporhead">Impor data</h2>
				<p class="small muted">
					Unggah berkas JSON hasil <a href="/api/export?format=json" target="_blank" rel="noopener"
						>export CekWakil</a
					>, atau tempel URL export dari mirror lain. Entri duplikat (isi + tanggal + pejabat
					sama) dilewati.
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
							placeholder="https://mirror.example/api/export?format=json" />
					</div>
					<button class="btn" type="submit">Impor</button>
				</form>
			</div>
		{/if}
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
	.err {
		color: var(--danger);
		margin: 0;
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
		gap: 6px;
		margin: 18px 0;
		flex-wrap: wrap;
	}
	.tabs button {
		padding: 7px 12px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--n-0);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
		color: var(--muted);
	}
	.tabs button.active {
		background: var(--text);
		color: #fff;
		border-color: var(--text);
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
	.inline {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}
	.inline .input {
		flex: 1 1 180px;
		min-width: 0;
	}
	.notice {
		margin-top: 14px;
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
	@media (max-width: 560px) {
		.toprow {
			flex-direction: column;
		}
		.inline .input {
			flex: 1 1 100%;
		}
		.inline .btn {
			width: 100%;
		}
	}
</style>
