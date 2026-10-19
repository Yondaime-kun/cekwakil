<script lang="ts">
	import { page } from '$app/state';
	const links = [
		{ href: '/pejabat', label: 'Pejabat' },
		{ href: '/blunder', label: 'Arsip' },
		{ href: '/harta', label: 'Harta' },
		{ href: '/panduan', label: 'Panduan' },
		{ href: '/submit', label: 'Lapor' }
	];
</script>

<header class="site-header">
	<div class="container navrow">
		<a href="/" class="brand">CekWakil</a>
		<nav aria-label="Navigasi utama">
			{#each links as l (l.href)}
				<a href={l.href} class:current={page.url.pathname.startsWith(l.href)}>{l.label}</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(251, 251, 250, 0.94);
		backdrop-filter: saturate(180%) blur(10px);
		border-bottom: 1px solid var(--line);
	}
	.navrow {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		height: 60px;
	}
	.brand {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
	}
	.brand::before {
		content: '';
		display: inline-block;
		width: 7px;
		height: 7px;
		margin-right: 8px;
		border-radius: 50%;
		background: var(--accent);
		vertical-align: 2px;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	nav a {
		padding: 7px 11px;
		font-size: 14px;
		font-weight: 520;
		color: var(--text-2);
		text-decoration: none;
		border-radius: var(--radius);
		white-space: nowrap;
	}
	nav a:hover {
		color: var(--text);
		background: var(--n-100);
	}
	nav a.current {
		color: var(--text);
		background: var(--n-100);
		font-weight: 600;
	}
	@media (max-width: 560px) {
		.navrow {
			height: auto;
			min-height: 54px;
			flex-wrap: wrap;
			padding-top: 8px;
			padding-bottom: 8px;
			gap: 2px 12px;
		}
		nav {
			gap: 0;
			overflow-x: auto;
			scrollbar-width: none;
			max-width: 100%;
		}
		nav::-webkit-scrollbar {
			display: none;
		}
		nav a {
			padding: 6px 7px;
			font-size: 13px;
		}
	}
</style>
