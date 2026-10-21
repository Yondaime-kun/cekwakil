<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/inter-tight';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Skeleton from '#lib/components/Skeleton.svelte';
	import Toaster from '#lib/components/Toaster.svelte';
	import { navigating, page } from '$app/state';
	import { SITE_URL } from '#lib/site';

	// Canonical menunjuk domain produksi, bukan origin workers.dev.
	const canonical = $derived(`${SITE_URL}${page.url.pathname}`);

	// Skeleton hanya muncul kalau navigasi benar-benar lambat (>300ms).
	// Sebelumnya berkedip di tiap navigasi walau data sudah di-prefetch.
	let { children } = $props();
	let lambat = $state(false);

	$effect(() => {
		if (!navigating.to) {
			lambat = false;
			return;
		}
		const t = setTimeout(() => (lambat = true), 300);
		return () => clearTimeout(t);
	});

	// Petakan tujuan navigasi ke skeleton yang strukturnya mirip halaman itu,
	// supaya transisi ke konten asli tidak terasa melompat.
	type Varian =
		| 'beranda'
		| 'arsip'
		| 'direktori'
		| 'profil'
		| 'harta'
		| 'panduan'
		| 'dokumen'
		| 'form'
		| 'daftar';
	const varian = $derived.by<Varian>(() => {
		const p = navigating.to?.url.pathname ?? '';
		if (p === '/' || p === '') return 'beranda';
		if (/^\/pejabat\/[^/]+\/edit$/.test(p)) return 'form';
		if (/^\/pejabat\/[^/]+$/.test(p) && p !== '/pejabat/tambah') return 'profil';
		if (p.startsWith('/pejabat/tambah')) return 'form';
		if (p.startsWith('/pejabat')) return 'direktori';
		if (p.startsWith('/blunder')) return 'arsip';
		if (p.startsWith('/harta')) return 'harta';
		if (p.startsWith('/lengkapi') || p.startsWith('/banding')) return 'direktori';
		if (p.startsWith('/panduan')) return 'panduan';
		if (p.startsWith('/kontribusi')) return 'dokumen';
		if (/^\/entri\/[^/]+\/(edit|riwayat)$/.test(p)) return 'form';
		if (p.startsWith('/tinjau')) return 'daftar';
		if (p.startsWith('/submit') || p.startsWith('/rekam') || p.startsWith('/laporkan'))
			return 'form';
		return 'daftar';
	});
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
</svelte:head>

<Nav />
<main id="konten" tabindex="-1">
	{#if lambat && navigating.to}
		<Skeleton variant={varian} />
	{:else}
		{@render children()}
	{/if}
</main>
<Footer />
<Toaster />

<style>
	main {
		min-height: 62vh;
	}
	main:focus {
		outline: none;
	}
</style>
