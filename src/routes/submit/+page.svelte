<script lang="ts">
	import { KATEGORI } from '#lib/types';

	let { data, form } = $props();
	let mengirim = $state(false);
	const pejabat = $derived(data.pejabat as Array<Record<string, unknown>>);

	let mode = $state<'existing' | 'new'>('existing');
	let cari = $state('');
	let terpilih = $state<Record<string, unknown> | null>(null);
	let sumber = $state(['']);

	const values = $derived((form?.values ?? {}) as Record<string, string>);
	const errors = $derived((form?.errors ?? []) as string[]);

	const hasil = $derived(
		cari.trim().length < 2
			? []
			: pejabat
					.filter((p) => String(p.nama).toLowerCase().includes(cari.trim().toLowerCase()))
					.slice(0, 8)
	);

	function pilih(p: Record<string, unknown>) {
		terpilih = p;
		cari = String(p.nama);
	}
	function tambahSumber() {
		sumber = [...sumber, ''];
	}
	function hapusSumber(i: number) {
		sumber = sumber.filter((_, idx) => idx !== i);
	}
</script>

<svelte:head>
	<title>Lapor pernyataan - CekWakil</title>
	<meta
		name="description"
		content="Kirim kutipan pernyataan pejabat beserta tautan sumber berita. Langsung tayang, bisa dikoreksi." />
</svelte:head>

<section class="container section narrow">
	<h1>Lapor pernyataan</h1>
	<p class="intro muted">
		Salin kutipan kata demi kata dan sertakan tautan sumbernya. Laporan langsung tayang — sama
		seperti wiki — dan peninjau akan mengoreksi atau membatalkan kalau tidak sesuai sumber.
	</p>

	{#if form?.success}
		<div class="card notice notice-info ok">
			<div>
				<h3>Terbit</h3>
				<p class="small">
					Entri kamu sudah tayang di arsip publik. Kalau ada yang keliru, siapa pun bisa
					melaporkan revisi.
				</p>
				<p class="btns">
					<a href="/blunder" class="btn btn-secondary btn-sm">Lihat arsip</a>
					<a href="/submit" class="btn btn-ghost btn-sm">Lapor lagi</a>
				</p>
			</div>
		</div>
	{:else}
		<form method="POST" class="card form" onsubmit={(e) => { if (mengirim) e.preventDefault(); else mengirim = true; }}>
			{#if errors.length > 0}
				<div class="notice notice-error">
					<div>
						<strong>Perbaiki dulu:</strong>
						<ul>
							{#each errors as e (e)}<li class="tiny">{e}</li>{/each}
						</ul>
					</div>
				</div>
			{/if}

			<fieldset>
				<legend class="label">Pejabat</legend>
				<div class="moderow">
					<label class="chip" class:chip-active={mode === 'existing'}>
						<input type="radio" name="mode" value="existing" bind:group={mode} hidden />
						Cari dari daftar
					</label>
					<label class="chip" class:chip-active={mode === 'new'}>
						<input type="radio" name="mode" value="new" bind:group={mode} hidden />
						Nama baru
					</label>
				</div>

				{#if mode === 'existing'}
					<input type="hidden" name="pejabat_id" value={terpilih ? terpilih.id : ''} />
					<div class="searchwrap">
						<input
							class="input"
							type="search"
							placeholder="Ketik nama pejabat..."
							bind:value={cari}
							autocomplete="off"
							oninput={() => (terpilih = null)} />
						{#if terpilih}
							<p class="helper dipilih">Dipilih: <strong>{terpilih.nama}</strong></p>
						{:else if hasil.length > 0}
							<ul class="hasil">
								{#each hasil as p (p.id)}
									<li>
										<button type="button" onclick={() => pilih(p)}>
											<span class="hnama">{p.nama}</span>
											<span class="hmeta tiny muted">
												{[p.jabatan, p.partai].filter(Boolean).join(' · ')}
											</span>
										</button>
									</li>
								{/each}
							</ul>
						{:else if cari.trim().length >= 2}
							<p class="helper">Tidak ada yang cocok. Pakai tab “Nama baru”.</p>
						{/if}
					</div>
				{:else}
					<label class="label" for="nama_pejabat_baru">Nama lengkap</label>
					<input
						class="input"
						id="nama_pejabat_baru"
						name="nama_pejabat_baru"
						value={values.nama_pejabat_baru ?? ''}
						placeholder="Contoh: Budi Santoso" />
					<p class="helper">Profil baru dibuat otomatis. Jabatan bisa dilengkapi peninjau.</p>
				{/if}
			</fieldset>

			<div class="fgroup">
				<label class="label" for="isi">Kutipan pernyataan (kata demi kata)</label>
				<textarea
					class="input"
					id="isi"
					name="isi"
					rows="4"
					required
					placeholder="Tulis persis kalimat yang diucapkan...">{values.isi ?? ''}</textarea>
			</div>

			<div class="fgroup">
				<label class="label" for="konteks">Konteks singkat</label>
				<textarea
					class="input"
					id="konteks"
					name="konteks"
					rows="2"
					placeholder="Di mana, pada acara apa, kenapa pernyataan ini jadi sorotan...">{values.konteks ??
						''}</textarea>
			</div>

			<div class="two">
				<div class="fgroup">
					<label class="label" for="kategori">Kategori</label>
					<select class="input" id="kategori" name="kategori" required>
						<option value="" disabled selected={!values.kategori}>Pilih kategori...</option>
						{#each KATEGORI as k (k)}
							<option value={k} selected={k === values.kategori}>{k}</option>
						{/each}
					</select>
				</div>
				<div class="fgroup">
					<label class="label" for="tanggal">Tanggal pernyataan</label>
					<input
						class="input"
						id="tanggal"
						name="tanggal"
						type="date"
						required
						value={values.tanggal ?? ''} />
				</div>
			</div>

			<div class="fgroup">
				<span class="label">Tautan sumber</span>
				{#each sumber as _, i (i)}
					<div class="srcrow">
						<input
							class="input"
							name="sumber_url"
							type="url"
							required={i === 0}
							placeholder="https://..."
							aria-label={`Sumber ${i + 1}`} />
						{#if sumber.length > 1}
							<button type="button" class="del" onclick={() => hapusSumber(i)} aria-label="Hapus"
								>×</button
							>
						{/if}
					</div>
				{/each}
				<button type="button" class="addsrc" onclick={tambahSumber}>+ Tambah sumber lain</button>
				<p class="helper">
					Sertakan lebih dari satu kalau ada — makin banyak sumber, makin sulit dibantah.
					Setiap tautan diarsipkan otomatis.
				</p>
			</div>

			<div class="fgroup">
				<label class="label" for="submitter">Nama kamu (opsional)</label>
				<input class="input" id="submitter" name="submitter" value={values.submitter ?? ''} />
			</div>

			<button class="btn" type="submit" disabled={mengirim}>{mengirim ? "Menerbitkan..." : "Terbitkan"}</button>
		</form>
	{/if}
</section>

<style>
	.intro {
		margin-top: 6px;
		margin-bottom: 16px;
		max-width: 62ch;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
	legend {
		padding: 0;
	}
	.moderow {
		display: flex;
		gap: 8px;
		margin-bottom: 14px;
		flex-wrap: wrap;
	}
	.moderow .chip {
		padding: 9px 16px;
	}
	.searchwrap {
		position: relative;
	}
	.hasil {
		list-style: none;
		margin: 6px 0 0;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--n-25);
		max-height: 260px;
		overflow-y: auto;
	}
	.hasil button {
		display: flex;
		flex-direction: column;
		gap: 1px;
		width: 100%;
		text-align: left;
		padding: 9px 10px;
		border: none;
		border-radius: 6px;
		background: none;
		cursor: pointer;
		font: inherit;
	}
	.hasil button:hover {
		background: var(--n-50);
	}
	.hnama {
		font-size: 14px;
		font-weight: 600;
	}
	.dipilih {
		color: var(--text);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}
	.srcrow {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 8px;
	}
	.srcrow .input {
		flex: 1 1 auto;
		min-width: 0;
	}
	.del {
		flex: 0 0 auto;
		width: 36px;
		height: 36px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--n-25);
		color: var(--muted);
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
	}
	.addsrc {
		border: none;
		background: none;
		padding: 2px 0;
		color: var(--text);
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.form .btn {
		width: 100%;
		margin-top: 4px;
	}
	.btns {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		flex-wrap: wrap;
	}
	.ok h3 {
		margin-bottom: 6px;
	}
	.notice ul {
		margin: 6px 0 0;
		padding-left: 18px;
	}
	@media (max-width: 560px) {
		.two {
			grid-template-columns: 1fr;
		}
		.moderow .chip {
			flex: 1 1 auto;
			justify-content: center;
		}
	}
</style>
