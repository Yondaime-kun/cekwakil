<script lang="ts">
	let { form } = $props();
	let mengirim = $state(false);
	const values = $derived((form?.values ?? {}) as Record<string, string>);
</script>

<svelte:head>
	<title>Tambah pejabat - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<h1>Tambah pejabat</h1>
	<p class="small muted intro">
		Untuk pejabat yang belum ada di daftar — misalnya pejabat baru, pengganti antar waktu (PAW),
		atau pejabat daerah. Sistem otomatis menolak kalau namanya sudah terdaftar.
	</p>

	{#if form?.ok}
		<div class="card notice ok">
			<p class="small"><strong>Tersimpan.</strong> Profil baru tayang.</p>
			<a class="btn btn-secondary btn-sm" href={`/pejabat/${form.slug}`}>Lihat profil</a>
		</div>
	{:else if form?.slug}
		<div class="card notice">
			<p class="small">
				<strong>Sudah terdaftar.</strong> {form.message}
			</p>
			<a class="btn btn-secondary btn-sm" href={`/pejabat/${form.slug}`}>Buka profilnya</a>
		</div>
	{:else}
		{#if form?.message}<p class="small err">{form.message}</p>{/if}
		<form method="POST" class="card form" onsubmit={(e) => { if (mengirim) e.preventDefault(); else mengirim = true; }}>
			<div class="fgroup">
				<label class="label" for="nama">Nama lengkap</label>
				<input class="input" id="nama" name="nama" required value={values.nama ?? ''} />
			</div>
			<div class="fgroup">
				<label class="label" for="jabatan">Jabatan</label>
				<input class="input" id="jabatan" name="jabatan" required placeholder="Anggota DPR RI" />
			</div>
			<div class="two">
				<div class="fgroup">
					<label class="label" for="partai">Partai</label>
					<input class="input" id="partai" name="partai" placeholder="PDI-P" />
				</div>
				<div class="fgroup">
					<label class="label" for="komisi">Komisi</label>
					<input class="input" id="komisi" name="komisi" placeholder="Komisi IX" />
				</div>
			</div>
			<div class="two">
				<div class="fgroup">
					<label class="label" for="dapil">Dapil</label>
					<input class="input" id="dapil" name="dapil" placeholder="Jawa Tengah V" />
				</div>
				<div class="fgroup">
					<label class="label" for="suara">Perolehan suara</label>
					<input class="input" id="suara" name="suara" inputmode="numeric" placeholder="297366" />
				</div>
			</div>
			<div class="fgroup">
				<label class="label" for="sumber_url">Tautan sumber profil</label>
				<input
					class="input"
					id="sumber_url"
					name="sumber_url"
					type="url"
					required
					placeholder="https://id.wikipedia.org/wiki/..." />
				<p class="helper">Wajib — misalnya halaman Wikipedia, KPU, atau situs resmi instansi.</p>
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
