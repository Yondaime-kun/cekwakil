<script lang="ts">
	import { normalisasiNama } from '#lib/nama';

	let { form } = $props();
	let mengirim = $state(false);
	// svelte-ignore state_referenced_locally
	const values = (form?.values ?? {}) as Record<string, string>;

	// Cek duplikat langsung di klien: lebih cepat memberi tahu sebelum submit.
	let nama = $state(values.nama ?? '');
	const norm = $derived(nama.trim().length >= 3 ? normalisasiNama(nama) : '');
</script>

<svelte:head>
	<title>Tambah pejabat - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<h1>Tambah pejabat</h1>
	<p class="small muted intro">
		Untuk pejabat yang belum ada di daftar — pejabat baru, pengganti antar waktu (PAW), atau pejabat
		daerah. Nama dengan gelar dinormalisasi dulu, jadi “Ir. H. Ahmad Fauzi, M.Si.” akan dikenali sama
		dengan “Ahmad Fauzi”.
	</p>

	{#if form?.ok}
		<div class="card notice notice-info">
			<div>
				<p class="small"><strong>Profil dibuat.</strong> Sudah tayang dan bisa dikutip.</p>
				<a class="btn btn-secondary btn-sm" href={`/pejabat/${form.slug}`}>Lihat profil →</a>
			</div>
		</div>
	{:else if form?.slug}
		<div class="card notice notice-warn">
			<div>
				<p class="small"><strong>Sudah terdaftar.</strong> {form.message}</p>
				<a class="btn btn-secondary btn-sm" href={`/pejabat/${form.slug}`}>Buka profilnya →</a>
			</div>
		</div>
	{:else}
		{#if form?.message}
			<p class="notice notice-error tiny" role="alert">{form.message}</p>
		{/if}
		<form
			method="POST"
			class="card form"
			onsubmit={(e) => {
				if (mengirim) e.preventDefault();
				else mengirim = true;
			}}
		>
			<div class="fgroup">
				<label class="label" for="nama">Nama lengkap <span class="req">wajib</span></label>
				<input
					class="input"
					id="nama"
					name="nama"
					required
					minlength="3"
					bind:value={nama}
					placeholder="Contoh: Ir. H. Ahmad Fauzi, M.Si."
					autocomplete="off"
				/>
				{#if norm}
					<p class="helper">Dikenali sebagai: <span class="mono">{norm}</span></p>
				{/if}
			</div>

			<div class="fgroup">
				<label class="label" for="jabatan">Jabatan <span class="req">wajib</span></label>
				<input
					class="input"
					id="jabatan"
					name="jabatan"
					required
					placeholder="Anggota DPR RI / Menteri Keuangan"
				/>
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
				<label class="label" for="sumber_url">Tautan sumber profil <span class="req">wajib</span></label>
				<input
					class="input"
					id="sumber_url"
					name="sumber_url"
					type="url"
					required
					placeholder="https://id.wikipedia.org/wiki/…"
				/>
				<p class="helper">Wikipedia, KPU, atau situs resmi instansi — supaya data bisa diperiksa.</p>
			</div>

			<button class="btn" type="submit" disabled={mengirim}>
				{mengirim ? 'Menyimpan…' : 'Tambahkan profil'}
			</button>
		</form>
	{/if}
</section>

<style>
	.intro {
		margin: 8px 0 18px;
		max-width: 64ch;
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
	.req {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--danger);
		margin-left: 4px;
	}
	.form .btn {
		width: 100%;
	}
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
