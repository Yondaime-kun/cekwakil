<script lang="ts">
	import { page } from '$app/state';
	import SearchDialog from './SearchDialog.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const links = [
		{ href: '/pejabat', label: 'Pejabat' },
		{ href: '/blunder', label: 'Arsip' },
		{ href: '/harta', label: 'Harta' },
		{ href: '/panduan', label: 'Panduan' }
	];

	let cariOpen = $state(false);
	let menuOpen = $state(false);

	// Halaman aktif: cocok kalau path sama persis atau turunannya,
	// supaya "/pejabat/tambah" tidak dianggap aktif di "/pejabat".
	function aktif(href: string): boolean {
		const p = page.url.pathname;
		return p === href || p.startsWith(`${href}/`);
	}

	function bukaPalette() {
		cariOpen = true;
		menuOpen = false;
	}

	// Keyboard global: ⌘K / Ctrl+K, dan "/" kalau bukan sedang mengetik.
	function ongobal(e: KeyboardEvent) {
		const el = e.target as HTMLElement | null;
		const mengetik =
			el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.isContentEditable;
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			cariOpen = !cariOpen;
			return;
		}
		if (e.key === '/' && !mengetik && !cariOpen) {
			e.preventDefault();
			cariOpen = true;
		}
		if (e.key === 'Escape') menuOpen = false;
	}

	// Tutup menu mobile saat pindah halaman.
	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});
</script>

<svelte:window on:keydown={ongobal} />

<a href="#konten" class="skip-link">Lewati ke konten</a>

<header class="site-header">
	<div class="container navrow">
		<a href="/" class="brand" aria-label="CekWakil, ke beranda">
			<img class="mark" src="/favicon.svg" alt="" width="22" height="22" aria-hidden="true" />
			CekWakil
		</a>

		<nav class="desktop" aria-label="Navigasi utama">
			{#each links as l (l.href)}
				<a href={l.href} class:current={aktif(l.href)} aria-current={aktif(l.href) ? 'page' : undefined}
					>{l.label}</a
				>
			{/each}
		</nav>

		<div class="actions">
			<button class="searchbtn" type="button" onclick={bukaPalette} aria-label="Cari pejabat atau kutipan">
				<svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15">
					<circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
					<path d="m13 13 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
				<span class="sblabel">Cari</span>
				<kbd aria-hidden="true">⌘K</kbd>
			</button>

			<ThemeToggle />

			<a href="/submit" class="btn btn-sm lapor">Lapor</a>

			<button
				class="burger"
				type="button"
				aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
				aria-expanded={menuOpen}
				aria-controls="menu-mobile"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
					{#if menuOpen}
						<path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
					{:else}
						<path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	{#if menuOpen}
		<nav id="menu-mobile" class="mobile" aria-label="Navigasi utama (mobile)">
			{#each links as l (l.href)}
				<a href={l.href} class:current={aktif(l.href)} aria-current={aktif(l.href) ? 'page' : undefined}
					>{l.label}</a
				>
			{/each}
			<a href="/laporkan" class:current={aktif('/laporkan')}>Laporkan entri</a>
			<a href="/submit" class="mobile-lapor">+ Laporkan pernyataan baru</a>
		</nav>
	{/if}
</header>

<SearchDialog bind:open={cariOpen} />

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 40;
		background: color-mix(in srgb, var(--surface-sunken) 88%, transparent);
		backdrop-filter: saturate(180%) blur(10px);
		border-bottom: 1px solid var(--line);
	}
	.navrow {
		display: flex;
		align-items: center;
		gap: 12px;
		height: var(--header-h);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		margin-right: 4px;
	}
	.brand:hover {
		text-decoration: none;
	}
	.mark {
		display: block;
		width: 22px;
		height: 22px;
		margin-right: 8px;
		border-radius: 5px;
		flex: 0 0 auto;
	}
	.desktop {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-right: auto;
	}
	.desktop a {
		padding: 7px 11px;
		font-size: 14px;
		font-weight: 520;
		color: var(--text-2);
		text-decoration: none;
		border-radius: var(--radius);
		white-space: nowrap;
	}
	.desktop a:hover {
		color: var(--text);
		background: var(--n-100);
	}
	.desktop a.current {
		color: var(--text);
		background: var(--n-100);
		font-weight: 600;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}
	.searchbtn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		min-height: 34px;
		padding: 5px 10px;
		font: inherit;
		font-size: 13px;
		color: var(--text-2);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		cursor: pointer;
	}
	.searchbtn:hover {
		color: var(--text);
		border-color: var(--line-strong);
	}
	.searchbtn kbd {
		font-family: inherit;
		font-size: 10.5px;
		font-weight: 600;
		padding: 1px 4px;
		border: 1px solid var(--line);
		border-radius: 3px;
		color: var(--text-3);
	}
	.burger {
		display: none;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		font: inherit;
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		cursor: pointer;
	}
	.mobile {
		display: none;
	}
	@media (max-width: 860px) {
		.desktop {
			display: none;
		}
		.burger {
			display: inline-flex;
		}
		.searchbtn .sblabel,
		.searchbtn kbd {
			display: none;
		}
		.searchbtn {
			width: 38px;
			height: 38px;
			justify-content: center;
			padding: 0;
		}
		.mobile {
			display: flex;
			flex-direction: column;
			padding: 6px 20px 14px;
			border-top: 1px solid var(--line);
			background: var(--surface);
			animation: slide 140ms var(--ease);
		}
		@keyframes slide {
			from {
				opacity: 0;
				transform: translateY(-4px);
			}
		}
		.mobile a {
			padding: 12px 4px;
			font-size: 15px;
			font-weight: 540;
			color: var(--text);
			text-decoration: none;
			border-bottom: 1px solid var(--line);
		}
		.mobile a.current {
			color: var(--accent);
			font-weight: 650;
		}
		.mobile a.mobile-lapor {
			margin-top: 12px;
			border: none;
			text-align: center;
			color: var(--n-0);
			background: var(--accent);
			border-radius: var(--radius);
			font-weight: 600;
		}
	}
	@media (max-width: 400px) {
		.lapor {
			display: none;
		}
	}
</style>
