<script lang="ts">
	import { page } from '$app/state';

	let { form } = $props();
	let mengirim = $state(false);
	const id = $derived(page.url.searchParams.get('entri') ?? '');
</script>

<svelte:head>
	<title>Laporkan entri - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	{#if form?.ok}
		<h1>Laporan terkirim</h1>
		<p class="small muted intro">
			Terima kasih. Peninjau akan memeriksa entri itu terhadap sumbernya. Kalau memang keliru,
			entri ditarik dari publikasi dan alasan pencabutannya dicatat.
		</p>
		<a class="btn btn-secondary btn-sm" href="/blunder">Kembali ke arsip</a>
	{:else}
		<h1>Laporkan entri</h1>
		<p class="small muted intro">
			Kalau kutipan tidak sesuai sumber, sumbernya tidak mendukung, atau data orangnya salah —
			laporkan di sini. Sebutkan bagian mana yang keliru.
		</p>
		{#if form?.message}<p class="small err">{form.message}</p>{/if}
		<form method="POST" class="card form" onsubmit={(e) => { if (mengirim) e.preventDefault(); else mengirim = true; }}>
			<div class="fgroup">
				<label class="label" for="pernyataan_id">ID entri</label>
				<input class="input" id="pernyataan_id" name="pernyataan_id" value={id} required />
				<p class="helper">Angka setelah tanda # pada entri arsip.</p>
			</div>
			<div class="fgroup">
				<label class="label" for="alasan">Apa yang keliru?</label>
				<textarea
					class="input"
					id="alasan"
					name="alasan"
					rows="4"
					required
					placeholder="Contoh: kalimat yang dikutip tidak ada di artikel sumber."></textarea>
			</div>
			<button class="btn" type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "Kirim laporan"}</button>
		</form>
	{/if}
</section>

<style>
	.intro {
		margin: 8px 0 18px;
		max-width: 60ch;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 18px;
	}
	.form .btn {
		width: 100%;
	}
	.err {
		color: var(--danger);
	}
</style>
