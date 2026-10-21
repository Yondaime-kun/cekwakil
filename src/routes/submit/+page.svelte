<script lang="ts">
	import { KATEGORI } from '#lib/types';
	import { normalisasiNama } from '#lib/nama';
	import Select from '#lib/components/Select.svelte';

	let { data, form } = $props();
	let mengirim = $state(false);
	const pejabat = $derived(data.pejabat as Array<Record<string, unknown>>);

	// Kalau datang dari tombol "kutipan untuk dia" (?pejabat=slug), langsung
	// terpilih. Kalau tidak, mode pencarian biasa.
	// svelte-ignore state_referenced_locally
	const awal = data.terpilih as Record<string, unknown> | null;
	let mode = $state<'existing' | 'new'>('existing');
	// svelte-ignore state_referenced_locally
	let cari = $state(awal ? String(awal.nama) : '');
	// svelte-ignore state_referenced_locally
	let terpilih = $state<Record<string, unknown> | null>(awal);
	let sumber = $state(['']);

	const values = $derived((form?.values ?? {}) as Record<string, string>);
	const errors = $derived((form?.errors ?? []) as string[]);

	// Pencarian: utamakan nama yang diawali, lalu substring, lalu kemiripan
	// nama tanpa gelar — supaya "Ahmad Fauzi" tetap ketemu "Ir. H. Ahmad Fauzi".
	const hasil = $derived.by(() => {
		const term = cari.trim().toLowerCase();
		if (term.length < 2) return [];
		const norm = normalisasiNama(cari);
		const skor = (p: Record<string, unknown>) => {
			const nama = String(p.nama).toLowerCase();
			if (nama.startsWith(term)) return 0;
			if (nama.includes(term)) return 1;
			if (normalisasiNama(String(p.nama)).includes(norm)) return 2;
			return 9;
		};
		return pejabat
			.map((p) => ({ p, s: skor(p) }))
			.filter((x) => x.s < 9)
			.sort((a, b) => a.s - b.s || String(a.p.nama).localeCompare(String(b.p.nama)))
			.slice(0, 8)
			.map((x) => x.p);
	});

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

	const konteks = $derived(values.konteks ?? '');
	const hariIni = new Date().toISOString().slice(0, 10);
	// Tanggal peristiwa tidak boleh di masa depan — sumbernya belum ada.
	const tanggalValid = $derived(!values.tanggal || values.tanggal <= hariIni);
	const isiValid = $derived(!values.isi || values.isi.trim().length >= 20);
	const konteksValid = $derived(!konteks || konteks.trim().length >= 10);
</script>

<svelte:head>
	<title>Lapor pernyataan - CekWakil</title>
	<meta
		name="description"
		content="Kirim kutipan pernyataan pejabat beserta tautan sumber berita. Langsung tayang, bisa dikoreksi siapa pun."
	/>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<h1>Lapor pernyataan</h1>
	<p class="intro muted">
		Salin kutipan <strong>kata demi kata</strong> dan sertakan tautan sumbernya. Laporan langsung
		tayang — model wiki — dan siapa pun bisa mengoreksi kalau tidak sesuai sumber.
	</p>

	{#if form?.success}
		<div class="card notice notice-info done">
			<div>
				<h3>Terbit — terima kasih</h3>
				<p class="small">
					Kutipanmu sudah tayang di arsip publik{#if form.id} (entri #{form.id}){/if}. Tiap sumber
					sedang diarsipkan ke Wayback Machine supaya tetap bisa dibuka walau artikel aslinya hilang.
				</p>
				<p class="btns">
					<a href="/blunder" class="btn btn-sm">Lihat arsip</a>
					<a href="/submit" class="btn btn-secondary btn-sm">Lapor lagi</a>
				</p>
			</div>
		</div>
	{:else}
		<form
			method="POST"
			class="card form"
			onsubmit={(e) => {
				if (mengirim) e.preventDefault();
				else mengirim = true;
			}}
		>
			{#if errors.length > 0}
				<div class="notice notice-error" role="alert" tabindex="-1" id="ringkasan-error">
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
					<label class="seg" class:aktif={mode === 'existing'}>
						<input type="radio" name="mode" value="existing" bind:group={mode} />
						Cari dari daftar
					</label>
					<label class="seg" class:aktif={mode === 'new'}>
						<input type="radio" name="mode" value="new" bind:group={mode} />
						Nama baru
					</label>
				</div>

				{#if mode === 'existing'}
					<input type="hidden" name="pejabat_id" value={terpilih ? terpilih.id : ''} />
					<div class="searchwrap">
						<input
							class="input"
							type="search"
							placeholder="Ketik nama pejabat… (gelar boleh dipakai/tidak)"
							bind:value={cari}
							autocomplete="off"
							aria-label="Cari pejabat"
							oninput={() => {
								if (terpilih && cari !== String(terpilih.nama)) terpilih = null;
							}}
						/>
						{#if terpilih}
							<p class="helper dipilih">
								<span class="check" aria-hidden="true">✓</span> Dipilih:
								<strong>{terpilih.nama}</strong>
								<span class="muted">— {[terpilih.jabatan, terpilih.partai].filter(Boolean).join(' · ')}</span>
							</p>
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
							<p class="helper">
								Tidak ada yang cocok. Pakai “Nama baru” kalau memang belum terdaftar.
							</p>
						{/if}
					</div>
				{:else}
					<label class="label" for="nama_pejabat_baru">Nama lengkap</label>
					<input
						class="input"
						id="nama_pejabat_baru"
						name="nama_pejabat_baru"
						value={values.nama_pejabat_baru ?? ''}
						placeholder="Contoh: Budi Santoso"
						autocomplete="off"
					/>
					<p class="helper">
						Profil baru dibuat otomatis. Gelar di nama akan dinormalisasi untuk mencegah duplikat.
					</p>
				{/if}
			</fieldset>

			<div class="fgroup">
				<label class="label" for="isi">
					Kutipan pernyataan <span class="req">wajib</span>
				</label>
				<textarea
					class="input"
					class:error={!isiValid}
					id="isi"
					name="isi"
					rows="4"
					required
					aria-describedby="isi-help"
					aria-invalid={!isiValid}
					placeholder="Tulis persis kalimat yang diucapkan, tanpa mengubah kata…"
				>{values.isi ?? ''}</textarea>
				<p class="helper" id="isi-help" class:error={!isiValid}>
					{#if !isiValid}
						Kurang dari 20 karakter — kutipan terlalu pendek untuk diverifikasi.
					{:else}
						Min. 20 karakter. Jangan tambahkan tanda kutip di awal/akhir, jangan rapikan kalimatnya.
					{/if}
				</p>
			</div>

			<div class="fgroup">
				<label class="label" for="konteks">
					Konteks <span class="req">wajib</span>
				</label>
				<textarea
					class="input"
					class:error={!konteksValid}
					id="konteks"
					name="konteks"
					rows="2"
					aria-invalid={!konteksValid}
					placeholder="Di mana, pada acara apa, dan kenapa jadi sorotan…"
				>{konteks}</textarea>
				<p class="helper" class:error={!konteksValid}>
					Konteks menjaga kutipan tidak dibaca di luar situasinya. Min. 10 karakter.
				</p>
			</div>

			<div class="two">
				<Select
					label="Kategori"
					ariaLabel="Kategori pernyataan"
					name="kategori"
					value={values.kategori ?? ''}
					placeholder="Pilih kategori…"
					options={KATEGORI.map((k) => ({ value: k, label: k }))}
				/>
				<div class="fgroup">
					<label class="label" for="tanggal">Tanggal pernyataan</label>
					<input
						class="input"
						class:error={!tanggalValid}
						id="tanggal"
						name="tanggal"
						type="date"
						required
						max={hariIni}
						value={values.tanggal ?? ''}
					/>
					{#if !tanggalValid}
						<p class="helper error">Tanggal tidak boleh di masa depan.</p>
					{/if}
				</div>
			</div>

			<div class="fgroup">
				<label class="label" for="tag">Tag <span class="muted">(opsional)</span></label>
				<input
					class="input"
					id="tag"
					name="tag"
					value={values.tag ?? ''}
					placeholder="anggaran, etik, mbg"
					autocomplete="off"
				/>
				<p class="helper">
					Pisahkan dengan koma, maksimal 5. Tag membantu orang menemukan pola antar pernyataan —
					kategori sudah ada, tag menjawab “soal apa”.
				</p>
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
							placeholder="https://…"
							aria-label={`Sumber ${i + 1}`}
						/>
						{#if sumber.length > 1}
							<button type="button" class="del" onclick={() => hapusSumber(i)} aria-label={`Hapus sumber ${i + 1}`}
								>×</button
							>
						{/if}
					</div>
				{/each}
				<button type="button" class="addsrc" onclick={tambahSumber}>+ Tambah sumber lain</button>
				<p class="helper">
					Sertakan lebih dari satu kalau ada — makin banyak sumber, makin sulit dibantah. Setiap
					tautan diarsipkan otomatis.
				</p>
			</div>

			<details class="optional">
				<summary>Nama kamu (opsional)</summary>
				<div class="fgroup">
					<label class="label" for="submitter">Akan ditampilkan sebagai pengirim</label>
					<input class="input" id="submitter" name="submitter" value={values.submitter ?? ''} />
				</div>
			</details>

			<div class="submitrow">
				<button class="btn btn-lg" type="submit" disabled={mengirim}>
					{mengirim ? 'Menerbitkan…' : 'Terbitkan sekarang'}
				</button>
				<p class="tiny muted">
					Dengan menerbitkan, kamu menyatakan kutipan ini sesuai teks sumber dan dapat diperiksa.
				</p>
			</div>
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
	.req {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--danger);
		margin-left: 4px;
		vertical-align: 1px;
	}
	.moderow {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}
	.seg {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 8px 15px;
		font-size: 13.5px;
		font-weight: 550;
		color: var(--text-2);
		background: var(--surface);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		cursor: pointer;
	}
	.seg input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.seg:focus-within {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.seg.aktif {
		color: var(--accent);
		background: var(--accent-soft);
		border-color: var(--accent-line);
		font-weight: 620;
	}
	.searchwrap {
		position: relative;
	}
	.dipilih {
		display: flex;
		align-items: center;
		gap: 5px;
		flex-wrap: wrap;
		color: var(--text);
	}
	.check {
		color: var(--ok);
		font-weight: 700;
	}
	.hasil {
		list-style: none;
		margin: 6px 0 0;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		max-height: 280px;
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
		border-radius: 4px;
		background: none;
		cursor: pointer;
		font: inherit;
		color: var(--text);
	}
	.hasil button:hover {
		background: var(--n-50);
	}
	.hnama {
		font-size: 14px;
		font-weight: 600;
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
		width: 40px;
		height: 40px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text-2);
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
	}
	.del:hover {
		color: var(--danger);
		border-color: var(--danger-line);
	}
	.addsrc {
		border: none;
		background: none;
		padding: 2px 0;
		color: var(--accent);
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.optional {
		border-top: 1px solid var(--line);
		padding-top: 14px;
	}
	.optional summary {
		font-size: 13px;
		font-weight: 580;
		color: var(--text-2);
		cursor: pointer;
		margin-bottom: 10px;
	}
	.submitrow {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.submitrow .btn {
		width: 100%;
	}
	.submitrow p {
		text-align: center;
		max-width: 52ch;
		margin: 0 auto;
	}
	.btns {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		flex-wrap: wrap;
	}
	.done h3 {
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
		.seg {
			flex: 1 1 auto;
			justify-content: center;
		}
	}
</style>
