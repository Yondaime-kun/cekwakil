<script lang="ts">
	import { page } from '$app/state';
	const status = $derived(page.status ?? 404);
</script>

<svelte:head>
	<title>{status} - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<p class="code mono">{status}</p>
	<h1>{status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}</h1>
	<p class="muted">
		{status === 404
			? 'Alamat ini tidak ada. Mungkin salah ketik, atau datanya memang belum tercatat.'
			: 'Halaman gagal dimuat. Coba muat ulang sebentar lagi — kalau terus berulang, kemungkinan ada data yang rusak.'}
	</p>
	{#if page.error?.message && status !== 404}
		<p class="tiny muted mono detail">{page.error.message}</p>
	{/if}

	<div class="btns">
		<a href="/" class="btn btn-secondary btn-sm">Kembali ke beranda</a>
		<a href="/blunder" class="btn btn-sm">Buka arsip</a>
	</div>

	<div class="suggest">
		<p class="tiny muted">Atau coba cari:</p>
		<form action="/blunder" method="GET" role="search" class="quick">
			<input
				class="input"
				name="q"
				type="search"
				placeholder="Kata dalam kutipan…"
				aria-label="Cari arsip"
			/>
			<button class="btn btn-sm btn-secondary" type="submit">Cari</button>
		</form>
	</div>
</section>

<style>
	.narrow {
		max-width: 560px;
	}
	.code {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-3);
		letter-spacing: 0.08em;
		margin-bottom: 8px;
	}
	p {
		margin-top: 12px;
	}
	.detail {
		padding: 8px 12px;
		background: var(--n-50);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		word-break: break-word;
	}
	.btns {
		display: flex;
		gap: 8px;
		margin-top: 20px;
		flex-wrap: wrap;
	}
	.suggest {
		margin-top: 28px;
		padding-top: 20px;
		border-top: 1px solid var(--line);
	}
	.quick {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}
	.quick .input {
		flex: 1 1 auto;
		min-width: 0;
	}
</style>
