<script lang="ts">
	import FotoPicker from '#lib/components/FotoPicker.svelte';

	let { data, form } = $props();
	let mengirim = $state(false);
	const person = $derived(data.person as Record<string, unknown> | null);

	// Field yang benar-benar diubah saja yang dikirim — server memakai
	// "kosong = jangan ubah", jadi ini tidak mengubah apa pun secara diam-diam.
	let bio = $state('');
	$effect(() => {
		bio = String(person?.bio ?? '');
	});
</script>

<svelte:head>
	<title>Sunting profil - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	{#if !person}
		<h1>Profil tidak ditemukan</h1>
		<p class="small muted intro">Pejabat dengan alamat ini tidak ada di daftar.</p>
		<a class="btn btn-secondary btn-sm" href="/pejabat">Kembali ke direktori</a>
	{:else}
		<nav class="crumbs tiny" aria-label="Breadcrumb">
			<a href="/pejabat">Pejabat</a><span aria-hidden="true">/</span>
			<a href={`/pejabat/${person.slug}`}>{person.nama}</a><span aria-hidden="true">/</span>
			<span aria-current="page">Sunting</span>
		</nav>

		<h1>Sunting profil</h1>
		<p class="small muted intro">
			Lengkapi data <strong>{person.nama}</strong>. Isi bagian yang kamu tahu saja — kolom yang kosong
			tidak akan mengubah data yang ada. Perubahan tanpa sumber bisa dilaporkan dan ditarik.
		</p>

		{#if form?.ok}
			<div class="card notice notice-info">
				<div>
					<p class="small"><strong>Tersimpan.</strong> Profil sudah diperbarui.</p>
					<a class="btn btn-secondary btn-sm" href={`/pejabat/${person.slug}`}>Lihat profil →</a>
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
					<label class="label" for="jabatan">Jabatan</label>
					<input
						class="input"
						id="jabatan"
						name="jabatan"
						value={person.jabatan ?? ''}
						placeholder="Anggota DPR RI"
					/>
				</div>
				<div class="fgroup">
					<label class="label" for="partai">Partai</label>
					<input class="input" id="partai" name="partai" value={person.partai ?? ''} placeholder="PDI-P" />
				</div>
				<div class="two">
					<div class="fgroup">
						<label class="label" for="komisi">Komisi</label>
						<input class="input" id="komisi" name="komisi" value={person.komisi ?? ''} placeholder="Komisi IX" />
					</div>
					<div class="fgroup">
						<label class="label" for="dapil">Dapil</label>
						<input class="input" id="dapil" name="dapil" value={person.dapil ?? ''} placeholder="Jawa Tengah V" />
					</div>
				</div>
				<div class="fgroup">
					<label class="label" for="bio">Bio singkat</label>
					<textarea
						class="input"
						id="bio"
						name="bio"
						rows="4"
						maxlength="1500"
						bind:value={bio}
						placeholder="Riwayat singkat: karier, posisi sebelumnya, kasus penting…"></textarea>
					<p class="helper">{bio.length}/1500</p>
				</div>
				<div class="fgroup">
					<label class="label" for="sumber_bio">Tautan sumber bio</label>
					<input
						class="input"
						id="sumber_bio"
						name="sumber_bio"
						type="url"
						value={person.sumber_bio ?? ''}
						placeholder="https://id.wikipedia.org/wiki/…"
					/>
					<p class="helper">Wajib kalau bio diisi — misalnya Wikipedia atau profil resmi instansi.</p>
				</div>
				<FotoPicker nama={String(person.nama)} fotoAwal={person.foto_url ? String(person.foto_url) : null} />
				<button class="btn" type="submit" disabled={mengirim}>
					{mengirim ? 'Menyimpan…' : 'Simpan perubahan'}
				</button>
			</form>
		{/if}
	{/if}
</section>

<style>
	.crumbs {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 14px;
		color: var(--text-3);
	}
	.crumbs a {
		color: var(--text-2);
		text-decoration: none;
	}
	.crumbs a:hover {
		text-decoration: underline;
	}
	.intro {
		margin: 8px 0 18px;
		max-width: 62ch;
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
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
