<script lang="ts">
	import '@fontsource-variable/inter-tight';
	import '../app.css';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Skeleton from '#lib/components/Skeleton.svelte';
	import { navigating } from '$app/state';

	let { children } = $props();
</script>

<Nav />
<main>
	{#if navigating.to}
		<!-- Skeleton selama navigasi antar halaman -->
		{#if navigating.to.url.pathname.startsWith('/pejabat/') && navigating.to.url.pathname !== '/pejabat/tambah'}
			<Skeleton mode="profil" />
		{:else if navigating.to.url.pathname.startsWith('/pejabat')}
			<Skeleton mode="pejabat" />
		{:else if navigating.to.url.pathname.startsWith('/blunder') || navigating.to.url.pathname.startsWith('/harta')}
			<Skeleton mode="list" />
		{:else}
			<Skeleton mode="list" />
		{/if}
	{:else}
		{@render children()}
	{/if}
</main>
<Footer />

<style>
	main {
		min-height: 62vh;
	}
</style>
