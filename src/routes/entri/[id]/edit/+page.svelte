<script lang="ts">
	import { renderMarkdown } from '#lib/markdown';

	let { data, form } = $props();
	const entri = $derived(data.entri as Record<string, unknown>);
	const values = $derived((form?.values ?? {}) as Record<string, string>);

	// Konteks memakai markdown; preview dirender di klien dengan fungsi yang
	// sama seperti server, jadi hasil preview == hasil simpan.
	// Nilai awal sengaja disalin sekali dari server (bukan di-bind ke props).
	// svelte-ignore state_referenced_locally
	let konteks = $state(values.konteks ?? String(entri.konteks ?? ''));
	let pratinjau = $state(false);
	const html = $derived(renderMarkdown(konteks));
</script>

<svelte:head>
	<title>Sunting entri #{entri.id} - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<nav class="crumbs tiny" aria-label="Breadcrumb">
		<a href={`/pejabat/${entri.slug}`}>{entri.nama}</a>
		<span aria-hidden="true">/</span>
		<a href={`/pejabat/${entri.slug}#p-${entri.id}`}>ENTRI #{entri.id}</a>
		<span aria-hidden="true">/</span>
		<span aria-current="page">Sunting</span>
	</nav>

	<h1>Sunting entri #{entri.id}</h1>
	<p class="small muted intro">
		Kamu tidak menghapus apa pun. Setiap penyuntingan tersimpan sebagai <strong>revisi baru</strong>
		yang bisa dibandingkan dan dikembalikan siapa pun.
	</p>

	{#if form?.message}
		<p class="notice notice-error tiny" role="alert">{form.message}</p>
	{/if}

	<form method="POST" action="?/sunting" class="stack">
		<div class="card fgroup">
			<label class="label" for="isi">Kutipan <span class="req">verbatim</span></label>
			<textarea class="input quote" id="isi" name="isi" rows="5" required>{values.isi ?? entri.isi}</textarea>
			<p class="helper">
				Harus persis seperti di sumber — tanpa markdown. Kalau mau menekankan sesuatu, taruh di
				konteks.
			</p>
		</div>

		<div class="card fgroup">
			<div class="kepala">
				<label class="label" for="konteks">Konteks</label>
				<div class="toggle" role="group" aria-label="Mode editor konteks">
					<button type="button" class:aktif={!pratinjau} onclick={() => (pratinjau = false)}>Tulis</button>
					<button type="button" class:aktif={pratinjau} onclick={() => (pratinjau = true)}>Pratinjau</button>
				</div>
			</div>

			{#if pratinjau}
				<div class="pratinjau md">{@html html}</div>
			{:else}
				<textarea class="input" id="konteks" name="konteks" rows="5" bind:value={konteks}></textarea>
			{/if}
			{#if pratinjau}<input type="hidden" name="konteks" value={konteks} />{/if}

			<p class="helper">
				Markdown didukung: <code>**tebal**</code>, <code>*miring*</code>, <code>`kode`</code>,
				<code>[teks](https://…)</code>, dan daftar dengan <code>-</code>.
			</p>
		</div>

		<div class="two">
			<div class="card fgroup">
				<label class="label" for="alasan">Alasan perubahan <span class="req">wajib</span></label>
				<input
					class="input"
					id="alasan"
					name="alasan"
					required
					minlength="10"
					value={values.alasan ?? ''}
					placeholder="Contoh: konteks kurang menyebut tanggal acara"
				/>
				<p class="helper">Tercatat di riwayat dan bisa dibaca siapa pun.</p>
			</div>
			<div class="card fgroup">
				<label class="label" for="oleh">Nama kamu <span class="muted">(opsional)</span></label>
				<input class="input" id="oleh" name="oleh" value={values.oleh ?? ''} autocomplete="nickname" />
				<p class="helper">Tanpa akun. Kosongkan kalau mau anonim.</p>
			</div>
		</div>

		<div class="aksi">
			<button class="btn" type="submit">Simpan sebagai revisi baru</button>
			<a class="btn btn-secondary" href={`/entri/${entri.id}/riwayat`}>Lihat riwayat</a>
		</div>
	</form>
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
	.stack {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.quote {
		font-size: 16px;
		line-height: 1.6;
	}
	.req {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--danger);
		margin-left: 4px;
	}
	.kepala {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 4px;
	}
	.toggle {
		display: inline-flex;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.toggle button {
		padding: 4px 12px;
		font: inherit;
		font-size: 12.5px;
		font-weight: 550;
		color: var(--text-2);
		background: var(--surface);
		border: none;
		cursor: pointer;
	}
	.toggle button.aktif {
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 650;
	}
	.pratinjau {
		min-height: 96px;
		padding: 10px 12px;
		border: 1px dashed var(--line-strong);
		border-radius: var(--radius);
		background: var(--n-25);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.aksi {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.aksi .btn {
		flex: 1 1 auto;
	}
	@media (max-width: 620px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
	/* Gaya untuk HTML hasil render markdown (tidak di-scope karena @html). */
	.md :global(p) {
		margin: 0 0 8px;
	}
	.md :global(p:last-child) {
		margin-bottom: 0;
	}
	.md :global(ul),
	.md :global(ol) {
		margin: 0 0 8px;
		padding-left: 20px;
	}
	.md :global(code) {
		font-family: ui-monospace, monospace;
		font-size: 0.9em;
		padding: 1px 4px;
		background: var(--n-100);
		border-radius: 3px;
	}
	.md :global(a) {
		color: var(--accent);
	}
</style>
