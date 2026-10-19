<script lang="ts">
	let { data, form } = $props();
	let mengirim = $state(false);
	const pejabat = $derived(data.pejabat as Array<Record<string, unknown>>);
	let cari = $state('');
	let dipilih = $state<Record<string, unknown> | null>(null);
	const hasil = $derived(
		cari.trim().length < 2
			? []
			: pejabat.filter((p) => String(p.nama).toLowerCase().includes(cari.toLowerCase())).slice(0, 8)
	);
</script>

<svelte:head>
	<title>Tambah rekam jejak - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<h1>Tambah rekam jejak</h1>
	<p class="small muted intro">
		Catat skandal, dugaan pelanggaran, atau rapor kerja seorang pejabat — dengan sumber berita.
		Entri langsung tayang; yang tidak disertai sumber bisa dilaporkan dan ditarik.
	</p>

	{#if form?.ok}
		<div class="card notice ok">
			<p class="small"><strong>Tersimpan.</strong> Muncul di profil pejabat bagian Rekam jejak.</p>
			{#if form.slug}
				<a class="btn btn-secondary btn-sm" href={`/pejabat/${form.slug}`}>Lihat profil</a>
			{/if}
		</div>
	{:else}
		{#if form?.message}<p class="small err">{form.message}</p>{/if}
		<form method="POST" class="card form" onsubmit={(e) => { if (mengirim) e.preventDefault(); else mengirim = true; }}>
			<div class="fgroup">
				<span class="label">Pejabat</span>
				<input type="hidden" name="pejabat_id" value={dipilih ? dipilih.id : ''} />
				<input
					class="input"
					type="search"
					placeholder="Ketik nama pejabat..."
					bind:value={cari}
					oninput={() => (dipilih = null)} />
				{#if dipilih}
					<p class="helper">Dipilih: <strong>{dipilih.nama}</strong></p>
				{:else if hasil.length > 0}
					<ul class="hasil">
						{#each hasil as p (p.id)}
							<li>
								<button type="button" onclick={() => { dipilih = p; cari = String(p.nama); }}>
									{p.nama}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="fgroup">
				<label class="label" for="judul">Judul kasus/peristiwa</label>
				<input
					class="input"
					id="judul"
					name="judul"
					required
					placeholder="Contoh: Dugaan pelanggaran etik soal wisuda kampus" />
			</div>

			<div class="fgroup">
				<label class="label" for="uraian">Uraian singkat (opsional)</label>
				<textarea class="input" id="uraian" name="uraian" rows="3"
					placeholder="Apa yang terjadi, apa statusnya sekarang..."></textarea>
			</div>

			<div class="two">
				<div class="fgroup">
					<label class="label" for="tahun">Tahun</label>
					<input class="input" id="tahun" name="tahun" type="number" min="1990" max="2100" required />
				</div>
				<div class="fgroup">
					<label class="label" for="sumber_url">Tautan berita</label>
					<input class="input" id="sumber_url" name="sumber_url" type="url" required placeholder="https://..." />
				</div>
			</div>

			<button class="btn" type="submit" disabled={mengirim}>{mengirim ? "Menyimpan..." : "Tambahkan"}</button>
		</form>
	{/if}
</section>

<style>
	.intro {
		margin: 8px 0 18px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 18px;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.hasil {
		list-style: none;
		margin: 6px 0 0;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--n-25);
		max-height: 220px;
		overflow-y: auto;
	}
	.hasil button {
		width: 100%;
		text-align: left;
		padding: 9px 10px;
		border: none;
		border-radius: 6px;
		background: none;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}
	.hasil button:hover {
		background: var(--n-50);
	}
	.form .btn {
		width: 100%;
	}
	.err {
		color: var(--danger);
		margin: 0;
	}
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
