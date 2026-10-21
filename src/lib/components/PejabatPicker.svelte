<script lang="ts">
	import { normalisasiNama } from '#lib/nama';

	// Input pencarian pejabat dengan autocomplete. Dipakai di form harta,
	// rekam jejak, dan mana pun yang butuh memilih satu pejabat.
	let {
		pejabat,
		awal = null,
		name = 'pejabat_id',
		label = 'Pejabat',
		placeholder = 'Ketik nama pejabat…'
	}: {
		pejabat: Array<Record<string, unknown>>;
		awal?: Record<string, unknown> | null;
		name?: string;
		label?: string;
		placeholder?: string;
	} = $props();

	// Nilai awal disengaja disalin sekali (prefill dari ?pejabat=), bukan
	// di-bind ke props — setelah user mengetik, state ini milik komponen.
	// svelte-ignore state_referenced_locally
	let cari = $state(awal ? String(awal.nama) : '');
	// svelte-ignore state_referenced_locally
	let dipilih = $state<Record<string, unknown> | null>(awal);
	let fokus = $state(false);

	// Skor: awalan nama > substring > kemiripan nama tanpa gelar.
	const hasil = $derived.by(() => {
		const term = cari.trim().toLowerCase();
		if (term.length < 2) return [];
		const norm = normalisasiNama(cari);
		const skor = (p: Record<string, unknown>) => {
			const nama = String(p.nama).toLowerCase();
			if (nama.startsWith(term)) return 0;
			if (nama.includes(term)) return 1;
			if (normalisasiNama(String(p.nama)).includes(norm)) return 2;
			return 9;
		};
		return pejabat
			.map((p) => ({ p, s: skor(p) }))
			.filter((x) => x.s < 9)
			.sort((a, b) => a.s - b.s || String(a.p.nama).localeCompare(String(b.p.nama)))
			.slice(0, 8)
			.map((x) => x.p);
	});

	const buka = $derived(fokus && !dipilih && hasil.length > 0);
</script>

<div class="fgroup">
	<label class="label" for={`cari-${name}`}>{label}</label>
	<input type="hidden" {name} value={dipilih ? dipilih.id : ''} />
	<input
		class="input"
		id={`cari-${name}`}
		type="search"
		{placeholder}
		bind:value={cari}
		autocomplete="off"
		aria-autocomplete="list"
		oninput={() => {
			if (dipilih && cari !== String(dipilih.nama)) dipilih = null;
		}}
		onfocus={() => (fokus = true)}
		onblur={() => setTimeout(() => (fokus = false), 120)}
	/>
	{#if dipilih}
		<p class="helper dipilih">
			<span class="check" aria-hidden="true">✓</span> Dipilih: <strong>{dipilih.nama}</strong>
		</p>
	{:else if buka}
		<ul class="hasil">
			{#each hasil as p (p.id)}
				<li>
					<button
						type="button"
						onmousedown={(e) => {
							e.preventDefault();
							dipilih = p;
							cari = String(p.nama);
							fokus = false;
						}}>{p.nama}</button
					>
				</li>
			{/each}
		</ul>
	{:else if cari.trim().length >= 2 && !dipilih}
		<p class="helper">Tidak ada yang cocok.</p>
	{/if}
</div>

<style>
	.dipilih {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--text);
	}
	.check {
		color: var(--ok);
		font-weight: 700;
	}
	.hasil {
		list-style: none;
		margin: 6px 0 0;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		max-height: 240px;
		overflow-y: auto;
	}
	.hasil button {
		width: 100%;
		text-align: left;
		padding: 9px 10px;
		border: none;
		border-radius: 4px;
		background: none;
		font: inherit;
		font-size: 14px;
		color: var(--text);
		cursor: pointer;
	}
	.hasil button:hover {
		background: var(--n-50);
	}
</style>
