<script lang="ts">
	let { data, form } = $props();
	let mengirim = $state(false);
	const person = $derived(data.person as Record<string, unknown> | null);
</script>

<svelte:head>
	<title>Sunting profil - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	{#if !person}
		<h1>Profil tidak ditemukan</h1>
		<a class="btn btn-secondary btn-sm" href="/pejabat">Kembali ke daftar</a>
	{:else}
		<h1>Sunting profil</h1>
		<p class="small muted intro">
			Lengkapi data <strong>{person.nama}</strong>. Isi bagian yang kamu tahu saja — kolom yang
			dikosongkan tidak berubah. Perubahan yang tidak disertai sumber bisa dilaporkan dan ditarik.
		</p>

		{#if form?.ok}
			<div class="card notice ok">
				<p class="small"><strong>Tersimpan.</strong></p>
				<a class="btn btn-secondary btn-sm" href={`/pejabat/${person.slug}`}>Lihat profil</a>
			</div>
		{:else}
			{#if form?.message}<p class="small err">{form.message}</p>{/if}
			<form method="POST" class="card form" onsubmit={(e) => { if (mengirim) e.preventDefault(); else mengirim = true; }}>
				<div class="fgroup">
					<label class="label" for="jabatan">Jabatan</label>
					<input class="input" id="jabatan" name="jabatan" value={person.jabatan ?? ''} placeholder={String(person.jabatan ?? '')} />
				</div>
				<div class="fgroup">
					<label class="label" for="partai">Partai</label>
					<input class="input" id="partai" name="partai" value={person.partai ?? ''} />
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
						placeholder="Riwayat singkat: karier, posisi sebelumnya, kasus penting...">{person.bio ?? ''}</textarea>
				</div>
				<div class="fgroup">
					<label class="label" for="sumber_bio">Tautan sumber bio</label>
					<input
						class="input"
						id="sumber_bio"
						name="sumber_bio"
						type="url"
						value={person.sumber_bio ?? ''}
						placeholder="https://..." />
					<p class="helper">Wajib kalau bio diisi — misalnya halaman Wikipedia atau profil resmi.</p>
				</div>
				<button class="btn" type="submit" disabled={mengirim}>{mengirim ? "Menyimpan..." : "Simpan"}</button>
			</form>
		{/if}
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
	}
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
