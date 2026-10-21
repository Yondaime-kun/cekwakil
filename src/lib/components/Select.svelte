<script lang="ts">
	// Dropdown custom: <select> native tidak bisa ditata di luar kotaknya
	// (popup-nya milik OS: putih, font sistem, tidak ikut dark mode).
	// Komponen ini memakai pola ARIA listbox supaya keyboard & screen reader
	// tetap benar, dan popup-nya sepenuhnya CSS kita.
	//
	// Tetap mengirim nilai lewat <input type="hidden"> dengan nama yang sama,
	// jadi form POST biasa tidak perlu diubah di sisi server.
	type Opsi = { value: string; label: string; hint?: string };

	let {
		options = [],
		value = $bindable(''),
		name,
		label,
		placeholder = 'Pilih…',
		ariaLabel,
		id,
		onchange
	}: {
		options?: Opsi[];
		value?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		ariaLabel?: string;
		id?: string;
		onchange?: (v: string) => void;
	} = $props();

	const fid = $derived(id ?? (name ? `sel-${name}` : `sel-${Math.random().toString(36).slice(2)}`));
	let buka = $state(false);
	let aktif = $state(0);
	let trig = $state<HTMLButtonElement>();
	let listEl = $state<HTMLUListElement>();
	let kotak = $state<HTMLDivElement>();

	const terpilih = $derived(options.find((o) => o.value === value) ?? null);

	function pilih(op: Opsi) {
		value = op.value;
		buka = false;
		onchange?.(op.value);
		trig?.focus();
	}

	function bukaMenu() {
		buka = true;
		const i = options.findIndex((o) => o.value === value);
		aktif = i >= 0 ? i : 0;
		// Fokus pindah ke listbox setelah render.
		queueMicrotask(() => listEl?.focus());
	}

	function onkeydown(e: KeyboardEvent) {
		if (!buka) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
				e.preventDefault();
				bukaMenu();
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			buka = false;
			trig?.focus();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			aktif = Math.min(options.length - 1, aktif + 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			aktif = Math.max(0, aktif - 1);
		} else if (e.key === 'Home') {
			e.preventDefault();
			aktif = 0;
		} else if (e.key === 'End') {
			e.preventDefault();
			aktif = options.length - 1;
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const op = options[aktif];
			if (op) pilih(op);
		} else if (e.key === 'Tab') {
			buka = false;
		}
	}

	// Tutup saat klik di luar.
	function onDocClick(e: MouseEvent) {
		if (buka && kotak && !kotak.contains(e.target as Node)) buka = false;
	}
</script>

<svelte:window onclick={onDocClick} />

<div class="fw" bind:this={kotak}>
	{#if label}
		<label class="label" for={fid}>{label}</label>
	{/if}
	{#if name}<input type="hidden" {name} {value} />{/if}

	<button
		type="button"
		bind:this={trig}
		id={fid}
		class="trigger"
		class:open={buka}
		aria-haspopup="listbox"
		aria-expanded={buka}
		aria-label={ariaLabel ?? label}
		onclick={() => (buka ? (buka = false) : bukaMenu())}
		onkeydown={onkeydown}
	>
		<span class:vazio={!terpilih}>{terpilih ? terpilih.label : placeholder}</span>
		<svg class="chev" aria-hidden="true" viewBox="0 0 16 16" width="15" height="15">
			<path
				d="M4 6.5 8 10.5l4-4"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if buka}
		<ul
			bind:this={listEl}
			class="menu"
			role="listbox"
			tabindex="-1"
			aria-labelledby={fid}
			{onkeydown}
			aria-activedescendant={options[aktif] ? `${fid}-o${aktif}` : undefined}
		>
			{#each options as op, i (op.value)}
				<li
					id={`${fid}-o${i}`}
					role="option"
					aria-selected={op.value === value}
					class:pilih={op.value === value}
					class:aktif={i === aktif}
					onclick={() => pilih(op)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							pilih(op);
						}
					}}
					onmouseenter={() => (aktif = i)}
				>
					<span>{op.label}</span>
					{#if op.hint}<span class="hint num">{op.hint}</span>{/if}
					{#if op.value === value}<svg class="cek" aria-hidden="true" viewBox="0 0 16 16" width="13" height="13"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.fw {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		width: 100%;
		min-height: 34px;
		padding: 4px 8px;
		font: inherit;
		font-size: 13.5px;
		font-weight: 500;
		color: var(--text);
		text-align: left;
		background: var(--surface);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			border-color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}
	.trigger:hover {
		border-color: var(--n-500);
	}
	.trigger:focus-visible,
	.trigger.open {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.vazio {
		color: var(--text-3);
	}
	.chev {
		flex: 0 0 auto;
		color: var(--text-2);
		transition: transform 140ms var(--ease);
	}
	.trigger.open .chev {
		transform: rotate(180deg);
		color: var(--accent);
	}

	.menu {
		position: absolute;
		z-index: 60;
		top: calc(100% + 4px);
		left: 0;
		min-width: 100%;
		max-height: 280px;
		overflow-y: auto;
		overscroll-behavior: contain;
		margin: 0;
		padding: 4px;
		list-style: none;
		background: var(--surface);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		box-shadow: var(--shadow-pop);
		outline: none;
		animation: drop 120ms var(--ease);
	}
	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
	.menu li {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 9px;
		font-size: 13.5px;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
	}
	.menu li > span:first-child {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.menu li.aktif {
		background: var(--n-100);
	}
	.menu li.pilih {
		color: var(--accent);
		font-weight: 600;
	}
	.hint {
		font-size: 11px;
		color: var(--text-3);
	}
	.cek {
		flex: 0 0 auto;
		color: var(--accent);
	}

	/* Target sentuh: popup naik tinggi dan baris lebih lega. */
	@media (pointer: coarse) {
		.trigger {
			min-height: 40px;
			font-size: 14px;
		}
		.menu li {
			padding: 10px;
			font-size: 14.5px;
		}
	}
</style>
