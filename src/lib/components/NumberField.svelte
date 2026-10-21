<script lang="ts">
	// Stepper number tanpa spinner bawaan browser. Presisi dipilih karena
	// spinner native bergantung OS dan tidak bisa ditata (dan tetap muncul
	// di sebagian browser walau CSS di-override).
	let {
		value = $bindable(''),
		name,
		id,
		min,
		max,
		step = 1,
		placeholder = '',
		inputmode = 'numeric',
		required = false,
		label,
		helper
	}: {
		value?: string;
		name: string;
		id?: string;
		min?: number;
		max?: number;
		step?: number;
		placeholder?: string;
		inputmode?: 'numeric' | 'decimal';
		required?: boolean;
		label?: string;
		helper?: string;
	} = $props();

	const fid = $derived(id ?? `num-${name}`);

	function ganti(delta: number) {
		const sekarang = Number(value) || (min !== undefined ? min - step : 0);
		let next = sekarang + delta;
		if (min !== undefined && next < min) next = min;
		if (max !== undefined && next > max) next = max;
		value = String(next);
	}
</script>

<div class="fgroup">
	{#if label}
		<label class="label" for={fid}>{label}</label>
	{/if}
	<div class="numeric">
		<input
			id={fid}
			class="input numfield"
			type="text"
			{name}
			{inputmode}
			{placeholder}
			{required}
			bind:value
		/>
		<div class="stepper" aria-hidden={false}>
			<button
				type="button"
				class="step"
				onclick={() => ganti(step)}
				aria-label="Tambah"
				tabindex="-1">+</button
			>
			<button
				type="button"
				class="step"
				onclick={() => ganti(-step)}
				aria-label="Kurangi"
				tabindex="-1">−</button
			>
		</div>
	</div>
	{#if helper}
		<p class="helper">{helper}</p>
	{/if}
</div>

<style>
	.numeric {
		position: relative;
		display: flex;
	}
	.numfield {
		padding-right: 38px;
		appearance: none;
		-moz-appearance: textfield;
		font-variant-numeric: tabular-nums;
	}
	/* Menyembunyikan spinner kalau browser tetap merendernya. */
	.numfield::-webkit-outer-spin-button,
	.numfield::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.stepper {
		position: absolute;
		right: 3px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--line);
	}
	.step {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 17px;
		padding: 0;
		font: inherit;
		font-size: 11px;
		font-weight: 700;
		line-height: 1;
		color: var(--text-2);
		background: transparent;
		border: none;
		cursor: pointer;
		user-select: none;
	}
	.step:first-child {
		border-bottom: 1px solid var(--line);
		border-radius: 0 3px 0 0;
	}
	.step:last-child {
		border-radius: 0 0 3px 0;
	}
	.step:hover {
		color: var(--accent);
		background: var(--n-50);
	}
	.step:active {
		background: var(--n-100);
	}
	/* Tombol kecil sulit dicapai di layar sentuh; sembunyikan, biarkan keyboard. */
	@media (pointer: coarse) {
		.stepper {
			display: none;
		}
		.numfield {
			padding-right: 12px;
		}
	}
</style>
