<script lang="ts">
	import { page } from '$app/state';
	const status = $derived(page.status ?? 404);
</script>

<svelte:head>
	<title>{status} - CekWakil</title>
</svelte:head>

<section class="container section narrow">
	<h1>{status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}</h1>
	<p class="muted">
		{status === 404
			? 'Alamat ini tidak ada. Mungkin salah ketik, atau datanya memang belum tercatat.'
			: 'Halaman gagal dimuat. Coba muat ulang sebentar lagi.'}
	</p>
	{#if page.error?.message && status !== 404}
		<p class="tiny muted mono">{page.error.message}</p>
	{/if}
	<p><a href="/" class="btn btn-secondary">Kembali ke beranda</a></p>
</section>

<style>
	.narrow {
		max-width: 620px;
	}
	p {
		margin-top: 10px;
	}
</style>
