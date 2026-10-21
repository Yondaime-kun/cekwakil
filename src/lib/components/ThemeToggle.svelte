<script lang="ts">
	import { onMount } from 'svelte';
	import { bacaTema, terapkanTema, temaBerikut, labelBerikut, type Tema } from '#lib/theme';

	// Tombol kecil yang berputar: sistem → gelap → terang → sistem.
	let tema = $state<Tema>('system');
	onMount(() => {
		tema = bacaTema();
	});

	function klik() {
		tema = temaBerikut(tema);
		terapkanTema(tema);
	}
</script>

<button
	type="button"
	class="themebtn"
	onclick={klik}
	aria-label={labelBerikut(tema)}
	title={labelBerikut(tema)}
>
	{#if tema === 'dark'}
		<!-- sedang gelap: ikon bulan terisi -->
		<svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17">
			<path
				d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z"
				fill="currentColor"
				stroke="currentColor"
				stroke-width="1.4"
				stroke-linejoin="round"
			/>
		</svg>
	{:else if tema === 'light'}
		<!-- sedang terang: ikon matahari -->
		<svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17">
			<circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6" />
			<path
				d="M10 2.6v1.8M10 15.6v1.8M2.6 10h1.8M15.6 10h1.8M4.8 4.8l1.3 1.3M13.9 13.9l1.3 1.3M15.2 4.8l-1.3 1.3M6.1 13.9l-1.3 1.3"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
		</svg>
	{:else}
		<!-- ikut sistem: ikon setengah -->
		<svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17">
			<circle cx="10" cy="10" r="6.4" fill="none" stroke="currentColor" stroke-width="1.6" />
			<path d="M10 3.6a6.4 6.4 0 0 1 0 12.8Z" fill="currentColor" />
		</svg>
	{/if}
</button>

<style>
	.themebtn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		padding: 0;
		color: var(--text-2);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			color 120ms var(--ease),
			border-color 120ms var(--ease);
	}
	.themebtn:hover {
		color: var(--text);
		border-color: var(--line-strong);
	}
	.themebtn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
