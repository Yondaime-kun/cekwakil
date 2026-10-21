<script lang="ts">
	import { page } from '$app/state';
	import { toast } from '#lib/toast';
	import { gambarKartu, namaFile, salinGambarKeClipboard, type DataKartu } from '#lib/kartu';

	// Bagikan tautan, atau kartu gambar 1200x630 (PNG) yang dibuat di browser.
	// PNG dibuat di klien karena Worker tidak punya canvas; lihat lib/kartu.ts.
	let {
		hash = '',
		label = 'Bagikan',
		compact = false,
		isian = false,
		dataKartu = null
	}: {
		hash?: string;
		label?: string;
		compact?: boolean;
		// `isian` = tombol berdiri sendiri (mis. di masthead profil). Kalau false,
		// tombol memakai gaya `.act` supaya menyatu dengan pil aksi EntryCard.
		isian?: boolean;
		dataKartu?: DataKartu | null;
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

	async function buat(): Promise<Blob | null> {
		if (!dataKartu) return null;
		const gelap = document.documentElement.getAttribute('data-theme') === 'dark';
		return await gambarKartu(dataKartu, gelap);
	}

	async function salinKartu() {
		sedang = true;
		try {
			const png = await buat();
			if (!png) throw new Error('tidak ada data');
			await salinGambarKeClipboard(png);
			await navigator.clipboard.writeText(url());
			toast('Kartu + tautan disalin');
		} catch {
			toast('Browser ini tidak bisa menyalin gambar — pakai Unduh', 'error');
		} finally {
			sedang = false;
			menu = false;
		}
	}

	async function unduh() {
		sedang = true;
		try {
			const png = await buat();
			if (!png || !dataKartu) throw new Error('tidak ada data');
			const alamat = URL.createObjectURL(png);
			const a = document.createElement('a');
			a.href = alamat;
			a.download = namaFile(dataKartu);
			a.click();
			setTimeout(() => URL.revokeObjectURL(alamat), 4000);
			toast('Kartu diunduh');
		} catch {
			toast('Gagal membuat kartu', 'error');
		} finally {
			sedang = false;
			menu = false;
		}
	}

	async function bagikan() {
		if (!dataKartu) return salin();
		sedang = true;
		try {
			const png = await buat();
			if (!png) return;
			const file = new File([png], namaFile(dataKartu), { type: 'image/png' });
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({ files: [file], url: url(), title: document.title });
			} else {
				await navigator.clipboard.writeText(url());
				toast('Perangkat ini tidak bisa membagikan gambar — tautan disalin');
			}
			menu = false;
		} catch (e) {
			// Pengguna menutup dialog share: bukan error.
			if (!(e instanceof Error) || e.name !== 'AbortError') {
				toast('Gagal membagikan', 'error');
			}
		} finally {
			sedang = false;
		}
	}

	function bukaMenu() {
		if (dataKartu) menu = !menu;
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

<div class="share-wrap" class:act={!isian}>
	<button
		class="btn btn-secondary btn-sm share"
		class:act={!isian}
		type="button"
		onclick={bukaMenu}
		disabled={sedang}
		aria-haspopup={dataKartu ? 'menu' : undefined}
		aria-expanded={dataKartu ? menu : undefined}
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
		<span class:hide={compact}>{sedang ? 'Menyiapkan…' : label}</span>
	</button>

	{#if menu && dataKartu}
		<div class="menu" role="menu" aria-label="Pilihan berbagi">
			<button type="button" role="menuitem" onclick={bagikan} disabled={sedang}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
					<path
						d="M3 8v4.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8M8 2.5v7.2M5 5.4 8 2.4l3 3"
						fill="none"
						stroke="currentColor"
						stroke-width="1.4"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Bagikan kartu
			</button>
			<button type="button" role="menuitem" onclick={salinKartu} disabled={sedang}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
					<rect x="2" y="2.5" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4" />
					<circle cx="6" cy="6.4" r="1.2" fill="currentColor" />
					<path d="m2.8 12 3.4-3.6 2.3 2.4 2-1.9 2.7 3.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
				</svg>
				Salin kartu
			</button>
			<button type="button" role="menuitem" onclick={unduh} disabled={sedang}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
					<path d="M8 2.6v7.2M4.9 7.1 8 10.2l3.1-3.1M3 12.8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Unduh kartu (PNG)
			</button>
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
		</div>
	{/if}
</div>

<style>
	/* Wrapper ikut mengambil bagian lebar pil aksi; tanpa ini tombolnya
	   menyusut ke selebar ikon dan labelnya hilang di layar sempit. */
	.share-wrap {
		position: relative;
		display: flex;
	}
	.share {
		gap: 6px;
	}
	/* Varian `.act`: meniru gaya butir aksi di pil EntryCard (border-left
	   pemisah, warna teks sekunder, padding rapat) tanpa menduplikasi kelas
	   global — kelas .act didefinisikan di EntryCard dan bersifat scoped.
	   Nilai di bawah ini menyalin persis .act milik EntryCard. */
	.share-wrap.act {
		flex: 0 1 auto;
	}
	.share.act {
		flex: 1 1 auto;
		gap: 5px;
		min-height: 0;
		padding: 4px 11px;
		font-size: 12.5px;
		font-weight: 550;
		color: var(--text-2);
		background: transparent;
		border: 0;
		border-left: 1px solid var(--accent-line);
		border-radius: 0;
		white-space: nowrap;
	}
	.share.act:hover {
		color: var(--accent);
		background: var(--n-50);
	}
	.menu {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 30;
		min-width: 190px;
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
		/* Sama seperti .act di EntryCard: tiap butir mengisi lebar pil. */
		.share-wrap.act {
			flex: 1 1 0;
		}
		.share.act {
			flex: 1 1 auto;
			justify-content: center;
			min-height: 0;
			padding: 7px 4px;
			font-size: 12px;
		}
	}
	.hide {
		display: inline;
	}
	@media (max-width: 420px) {
		/* Di dalam pil aksi, label ikut ditampilkan: butir lain juga bertulisan
		   dan tombol ikon-saja menyulitkan di layar sentuh. */
		.hide {
			display: none;
		}
		.share.act .hide {
			display: inline;
		}
	}
</style>
