<script lang="ts">
	import { page } from '$app/state';
	import { toast } from '#lib/toast';

	// Bagikan tautan, dan kalau halaman punya kartu gambar, kirim gambarnya
	// juga. Path kartu gambar disediakan server: tidak semua halaman punya.
	let {
		hash = '',
		label = 'Bagikan',
		compact = false,
		gambar = null
	}: {
		hash?: string;
		label?: string;
		compact?: boolean;
		gambar?: string | null;
	} = $props();

	let sedang = $state(false);
	let menu = $state(false);

	function url(): string {
		return `${page.url.origin}${page.url.pathname}${hash}`;
	}

	async function salin() {
		sedang = true;
		try {
			const share = url();
			if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
				await navigator.share({ url: share, title: document.title });
				return;
			}
			await navigator.clipboard.writeText(share);
			toast('Tautan disalin');
		} catch {
			toast('Tidak bisa menyalin otomatis', 'error');
		} finally {
			sedang = false;
			menu = false;
		}
	}

	// Gambar disalin sebagai PNG lewat clipboard; browser tertentu hanya
	// menerima image/png, jadi SVG di-rasterisasi dulu di canvas.
	async function salinGambar() {
		if (!gambar) return;
		sedang = true;
		try {
			const r = await fetch(gambar);
			if (!r.ok) throw new Error('gagal');
			const svg = await r.text();
			const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
			const bitmap = await createImageBitmap(blob);
			const c = document.createElement('canvas');
			c.width = bitmap.width;
			c.height = bitmap.height;
			const ctx = c.getContext('2d');
			if (!ctx) throw new Error('canvas');
			ctx.drawImage(bitmap, 0, 0);
			const png: Blob | null = await new Promise((res) => c.toBlob(res, 'image/png'));
			if (!png) throw new Error('png');

			const item = new ClipboardItem({ 'image/png': png });
			await navigator.clipboard.write([item]);
			await navigator.clipboard.writeText(url());
			toast('Gambar + tautan disalin');
		} catch {
			toast('Browser ini tidak bisa menyalin gambar — tautan saja bisa', 'error');
			try {
				await navigator.clipboard.writeText(url());
			} catch {
				/* biarkan */
			}
		} finally {
			sedang = false;
			menu = false;
		}
	}

	async function unduh() {
		if (!gambar) return;
		const a = document.createElement('a');
		a.href = gambar;
		a.download = `cekwakil-${page.url.pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '')}.svg`;
		a.click();
		menu = false;
	}

	function bukaMenu() {
		if (gambar) menu = !menu;
		else salin();
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') menu = false;
	}

	$effect(() => {
		if (!menu) return;
		const tutup = (e: MouseEvent) => {
			const el = e.target as HTMLElement | null;
			if (!el?.closest('.share-wrap')) menu = false;
		};
		document.addEventListener('click', tutup);
		return () => document.removeEventListener('click', tutup);
	});
</script>

<svelte:window on:keydown={onKey} />

<div class="share-wrap">
	<button
		class="btn btn-secondary btn-sm share"
		type="button"
		onclick={bukaMenu}
		disabled={sedang}
		aria-haspopup={gambar ? 'menu' : undefined}
		aria-expanded={gambar ? menu : undefined}
	>
		<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
			<path
				d="M6.2 9.8 9.8 6.2M6.5 4.3l1.2-1.2a2.6 2.6 0 1 1 3.7 3.7L10 8.1M5.4 6.7 4.3 7.8a2.6 2.6 0 1 0 3.7 3.7l1.1-1.1"
				fill="none"
				stroke="currentColor"
				stroke-width="1.4"
				stroke-linecap="round"
			/>
		</svg>
		<span class:hide={compact}>{label}</span>
	</button>

	{#if menu && gambar}
		<div class="menu" role="menu" aria-label="Pilihan berbagi">
			<button type="button" role="menuitem" onclick={salin} disabled={sedang}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
					<path
						d="M6.2 9.8 9.8 6.2M6.5 4.3l1.2-1.2a2.6 2.6 0 1 1 3.7 3.7L10 8.1M5.4 6.7 4.3 7.8a2.6 2.6 0 1 0 3.7 3.7l1.1-1.1"
						fill="none"
						stroke="currentColor"
						stroke-width="1.4"
						stroke-linecap="round"
					/>
				</svg>
				Salin tautan
			</button>
			<button type="button" role="menuitem" onclick={salinGambar} disabled={sedang}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
					<rect x="2" y="2.5" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4" />
					<circle cx="6" cy="6.4" r="1.2" fill="currentColor" />
					<path d="m2.8 12 3.4-3.6 2.3 2.4 2-1.9 2.7 3.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
				</svg>
				Salin gambar
			</button>
			<button type="button" role="menuitem" onclick={unduh} disabled={sedang}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
					<path d="M8 2.6v7.2M4.9 7.1 8 10.2l3.1-3.1M3 12.8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Unduh gambar
			</button>
		</div>
	{/if}
</div>

<style>
	.share-wrap {
		position: relative;
	}
	.share {
		gap: 6px;
	}
	.menu {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 30;
		min-width: 176px;
		padding: 5px;
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-pop);
		animation: muncul 120ms var(--ease);
	}
	.menu button {
		display: flex;
		align-items: center;
		gap: 9px;
		width: 100%;
		padding: 8px 10px;
		border: 0;
		border-radius: var(--radius);
		background: none;
		color: var(--text);
		font: inherit;
		font-size: 13.5px;
		text-align: left;
		cursor: pointer;
	}
	.menu button:hover,
	.menu button:focus-visible {
		background: var(--n-50);
	}
	.menu svg {
		color: var(--text-3);
		flex: 0 0 auto;
	}
	@keyframes muncul {
		from {
			opacity: 0;
			transform: translateY(-3px);
		}
	}
	@media (max-width: 720px) {
		.share {
			min-height: 40px;
		}
	}
	.hide {
		display: inline;
	}
	@media (max-width: 420px) {
		.hide {
			display: none;
		}
	}
</style>
