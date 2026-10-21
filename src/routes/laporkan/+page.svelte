<script lang="ts">
	import { page } from '$app/state';

	let { form } = $props();
	let mengirim = $state(false);
	const id = $derived(page.url.searchParams.get('entri') ?? '');
	let alasan = $state('');
	const cukup = $derived(alasan.trim().length >= 10);
</script>

<svelte:head>
	<title>Laporkan entri - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	{#if form?.ok}
		<div class="card done">
			<h1>Laporan terkirim</h1>
			<p class="small muted">
				Terima kasih. Peninjau akan memeriksa entri itu terhadap sumbernya. Kalau memang keliru, entri
				ditarik dari publikasi dan alasan pencabutannya dicatat permanen di halaman moderasi.
			</p>
			<div class="btns">
				<a class="btn btn-sm" href="/blunder">Kembali ke arsip</a>
				<a class="btn btn-secondary btn-sm" href={`/laporkan${id ? `?entri=${id}` : ''}`}
					>Laporkan entri lain</a
				>
			</div>
		</div>
	{:else}
		<h1>Laporkan entri</h1>
		<p class="small muted intro">
			Kalau kutipan tidak sesuai sumber, sumbernya tidak mendukung, atau data orangnya salah — laporkan
			di sini. Sebutkan <strong>bagian mana yang keliru</strong> supaya bisa dicek cepat.
		</p>

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
				<label class="label" for="pernyataan_id">ID entri</label>
				<input
					class="input num"
					id="pernyataan_id"
					name="pernyataan_id"
					value={id}
					required
					inputmode="numeric"
					readonly={!!id}
				/>
				<p class="helper">
					{#if id}
						Terisi otomatis dari tombol “Laporkan” di entri yang kamu klik.
					{:else}
						Angka setelah tanda # pada entri arsip di URL-nya.
					{/if}
				</p>
			</div>

			<div class="fgroup">
				<label class="label" for="alasan">Apa yang keliru?</label>
				<textarea
					class="input"
					id="alasan"
					name="alasan"
					rows="4"
					required
					minlength="10"
					bind:value={alasan}
					placeholder="Contoh: kalimat yang dikutip tidak ada di artikel sumber; sumbernya dari akun anonim, bukan media."
				></textarea>
				<p class="helper" class:error={alasan.length > 0 && !cukup}>
					{alasan.trim().length}/10 karakter minimum
				</p>
			</div>

			<button class="btn" type="submit" disabled={mengirim || !cukup}>
				{mengirim ? 'Mengirim…' : 'Kirim laporan'}
			</button>
		</form>
	{/if}
</section>

<style>
	.intro {
		margin: 8px 0 18px;
		max-width: 60ch;
	}
	.form,
	.done {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 18px;
	}
	.done h1 {
		font-size: 24px;
	}
	.form .btn {
		width: 100%;
	}
	.btns {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.input[readonly] {
		background: var(--n-50);
		color: var(--text-2);
	}
</style>
