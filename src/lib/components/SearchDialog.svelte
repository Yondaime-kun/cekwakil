<script lang="ts">
	import { goto } from '$app/navigation';
	import { fmtDate } from '#lib/utils';

	// Pencarian global: dibuka dengan ⌘K / Ctrl+K / "/" atau dari tombol nav.
	type Hasil = {
		pejabat: Array<{ slug: string; nama: string; jabatan: string; partai: string | null }>;
		pernyataan: Array<{
			id: number;
			isi: string;
			tanggal: string;
			kategori: string;
			nama: string;
			slug: string;
		}>;
	};

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let q = $state('');
	let hasil = $state<Hasil>({ pejabat: [], pernyataan: [] });
	let memuat = $state(false);
	let aktif = $state(0);
	let inputEl = $state<HTMLInputElement>();
	let dialogEl = $state<HTMLDialogElement>();

	// Daftar item yang bisa dipilih dengan panah, dalam urutan tampil.
	const items = $derived([
		...hasil.pejabat.map((p) => ({ kind: 'pejabat' as const, href: `/pejabat/${p.slug}`, data: p })),
		...hasil.pernyataan.map((p) => ({
			kind: 'pernyataan' as const,
			href: `/pejabat/${p.slug}#p-${p.id}`,
			data: p
		}))
	]);

	$effect(() => {
		if (open) {
			dialogEl?.showModal();
			inputEl?.focus();
		} else if (dialogEl?.open) {
			dialogEl.close();
		}
	});

	// Debounce 180ms supaya tidak menembak API tiap ketikan.
	$effect(() => {
		const term = q.trim();
		if (term.length < 2) {
			hasil = { pejabat: [], pernyataan: [] };
			memuat = false;
			return;
		}
		memuat = true;
		let batal = false;
		const t = setTimeout(async () => {
			try {
				const res = await fetch(`/api/cari?q=${encodeURIComponent(term)}`);
				if (!res.ok) throw new Error('gagal');
				const data = (await res.json()) as Hasil;
				if (!batal) {
					hasil = data;
					aktif = 0;
				}
			} catch {
				if (!batal) hasil = { pejabat: [], pernyataan: [] };
			} finally {
				if (!batal) memuat = false;
			}
		}, 180);
		return () => {
			batal = true;
			clearTimeout(t);
		};
	});

	function tutup() {
		open = false;
		q = '';
		aktif = 0;
	}

	function buka(href: string) {
		tutup();
		goto(href);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (items.length) aktif = (aktif + 1) % items.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (items.length) aktif = (aktif - 1 + items.length) % items.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const it = items[aktif];
			if (it) buka(it.href);
			else if (q.trim().length >= 2) buka(`/blunder?q=${encodeURIComponent(q.trim())}`);
		}
	}
</script>

<dialog bind:this={dialogEl} class="palette" onclose={tutup} aria-label="Pencarian CekWakil">
	<div class="inner">
		<div class="searchrow">
			<svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" class="ico">
				<circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
				<path d="m13 13 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
			</svg>
			<input
				bind:this={inputEl}
				bind:value={q}
				{onkeydown}
				class="q"
				type="text"
				role="combobox"
				aria-expanded={items.length > 0}
				aria-controls="hasil-cari"
				aria-autocomplete="list"
				aria-activedescendant={items[aktif] ? `hasil-${aktif}` : undefined}
				placeholder="Cari nama pejabat, dapil, atau kata dalam kutipan…"
				autocomplete="off"
				spellcheck="false"
			/>
			<button class="esc" type="button" onclick={tutup} aria-label="Tutup pencarian">Esc</button>
		</div>

		<div id="hasil-cari" class="hasil" role="listbox" aria-label="Hasil pencarian">
			{#if q.trim().length < 2}
				<p class="hint">
					Ketik minimal 2 huruf. <kbd>↑</kbd> <kbd>↓</kbd> untuk memilih, <kbd>Enter</kbd> untuk
					buka.
				</p>
			{:else if memuat && items.length === 0}
				<p class="hint">Mencari…</p>
			{:else if items.length === 0}
				<p class="hint">
					Tidak ada hasil untuk “{q.trim()}”.
					<a href={`/blunder?q=${encodeURIComponent(q.trim())}`}>Cari di seluruh arsip</a>
				</p>
			{:else}
				{#if hasil.pejabat.length > 0}
					<p class="grp">Pejabat</p>
					{#each hasil.pejabat as p, i (p.slug)}
						{@const idx = i}
						<a
							id={`hasil-${idx}`}
							class="item"
							class:aktif={aktif === idx}
							role="option"
							aria-selected={aktif === idx}
							href={`/pejabat/${p.slug}`}
							onmouseenter={() => (aktif = idx)}>{p.nama} <span
								class="item-meta">{p.jabatan}{p.partai ? ` · ${p.partai}` : ''}</span
							></a
						>
					{/each}
				{/if}
				{#if hasil.pernyataan.length > 0}
					<p class="grp">Kutipan</p>
					{#each hasil.pernyataan as p, i (p.id)}
						{@const idx = hasil.pejabat.length + i}
						<a
							id={`hasil-${idx}`}
							class="item item-kutipan"
							class:aktif={aktif === idx}
							role="option"
							aria-selected={aktif === idx}
							href={`/pejabat/${p.slug}#p-${p.id}`}
							onmouseenter={() => (aktif = idx)}
						>
							<span class="kutipan">“{p.isi.length > 110 ? `${p.isi.slice(0, 110)}…` : p.isi}”</span>
							<span class="item-meta">{p.nama} · {fmtDate(p.tanggal)}</span>
						</a>
					{/each}
				{/if}
				<a class="semua" href={`/blunder?q=${encodeURIComponent(q.trim())}`}>
					Semua hasil untuk “{q.trim()}” →
				</a>
			{/if}
		</div>
	</div>
</dialog>

<style>
	.palette {
		width: min(640px, calc(100vw - 32px));
		max-width: 640px;
		margin-top: max(12vh, 40px);
		padding: 0;
		border: 1px solid var(--line-strong);
		border-radius: 10px;
		background: var(--surface);
		color: var(--text);
		box-shadow: var(--shadow-modal);
		animation: pop 140ms var(--ease);
	}
	.palette::backdrop {
		background: rgba(16, 17, 19, 0.42);
		backdrop-filter: blur(2px);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.99);
		}
	}
	.inner {
		display: flex;
		flex-direction: column;
		max-height: min(560px, 74vh);
	}
	.searchrow {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-bottom: 1px solid var(--line);
	}
	.ico {
		color: var(--text-3);
		flex: 0 0 auto;
	}
	.q {
		flex: 1 1 auto;
		min-width: 0;
		border: none;
		background: none;
		font: inherit;
		font-size: 16px;
		color: var(--text);
		outline: none;
		padding: 2px 0;
	}
	.q::placeholder {
		color: var(--text-3);
	}
	.esc {
		flex: 0 0 auto;
		font: inherit;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 3px 7px;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--n-50);
		color: var(--text-2);
		cursor: pointer;
	}
	.hasil {
		overflow-y: auto;
		padding: 6px;
	}
	.hint {
		margin: 0;
		padding: 18px 12px;
		font-size: 13.5px;
		color: var(--text-2);
	}
	.grp {
		margin: 8px 8px 4px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.item {
		display: block;
		padding: 9px 10px;
		border-radius: 5px;
		text-decoration: none;
		color: var(--text);
		font-size: 14.5px;
		font-weight: 560;
	}
	.item.aktif {
		background: var(--n-100);
	}
	.item:hover {
		text-decoration: none;
	}
	.item-meta {
		display: block;
		font-size: 12.5px;
		font-weight: 450;
		color: var(--text-2);
		margin-top: 1px;
	}
	.item-kutipan .kutipan {
		display: block;
		font-weight: 500;
		font-size: 14px;
		line-height: 1.45;
	}
	.semua {
		display: block;
		margin-top: 6px;
		padding: 10px;
		border-top: 1px solid var(--line);
		font-size: 13px;
		font-weight: 600;
		text-align: center;
	}
	kbd {
		font-family: inherit;
		font-size: 11px;
		padding: 1px 5px;
		border: 1px solid var(--line-strong);
		border-bottom-width: 2px;
		border-radius: 3px;
		background: var(--n-50);
	}
</style>
