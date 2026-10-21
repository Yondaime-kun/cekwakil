<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { withParams } from '#lib/utils';
	import Select from '#lib/components/Select.svelte';

	// Paginasi bernomor: pertama, terakhir, dan jendela di sekitar halaman aktif.
	// Pakai <a href> asli (bisa di-share, bisa di-preload) bukan tombol JS.
	let { current, total, param = 'page' }: { current: number; total: number; param?: string } = $props();

	const nomor = $derived.by(() => {
		const out: Array<number | 'gap'> = [];
		const win = 1;
		const push = (n: number | 'gap') => {
			if (out[out.length - 1] !== n) out.push(n);
		};
		for (let i = 1; i <= total; i++) {
			const near = Math.abs(i - current) <= win || i === 1 || i === total;
			if (near) push(i);
			else if (out[out.length - 1] !== 'gap') push('gap');
		}
		return out;
	});

	// Pakai page.url, bukan location: komponen ini juga dirender di server.
	function href(n: number): string {
		return withParams(page.url.searchParams, { [param]: n === 1 ? null : n });
	}


</script>

<nav class="pager" aria-label="Navigasi halaman">
	<a
		class="btn btn-sm btn-secondary prev"
		href={href(current - 1)}
		aria-disabled={current <= 1}
		tabindex={current <= 1 ? -1 : undefined}
		>Sebelumnya</a
	>

	<ul class="nums">
		{#each nomor as n, i (i)}
			{#if n === 'gap'}
				<li class="gap" aria-hidden="true">…</li>
			{:else}
				<li>
					<a
						class="num"
						class:aktif={n === current}
						href={href(n)}
						aria-current={n === current ? 'page' : undefined}>{n}</a
					>
				</li>
			{/if}
		{/each}
	</ul>

	<div class="jump">
		<span class="tiny muted">Halaman</span>
		<Select
			ariaLabel="Lompat ke halaman"
			value={String(current)}
			options={Array.from({ length: total }, (_, i) => ({ value: String(i + 1), label: `${i + 1} / ${total}` }))}
			onchange={(v) => goto(href(Number(v)))}
		/>
	</div>

	<a
		class="btn btn-sm btn-secondary next"
		href={href(current + 1)}
		aria-disabled={current >= total}
		tabindex={current >= total ? -1 : undefined}
		>Berikutnya</a
	>
</nav>

<style>
	.pager {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 24px;
		flex-wrap: wrap;
	}
	.pager .btn[aria-disabled='true'] {
		opacity: 0.45;
		pointer-events: none;
	}
	.nums {
		display: flex;
		align-items: center;
		gap: 2px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 6px;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		color: var(--text-2);
		border-radius: var(--radius);
		text-decoration: none;
	}
	.num:hover {
		background: var(--n-100);
		color: var(--text);
		text-decoration: none;
	}
	.num.aktif {
		background: var(--text);
		color: var(--surface);
		font-weight: 650;
	}
	:global(:root[data-theme='dark']) .num.aktif {
		color: var(--surface-sunken);
	}
	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='light']):not([data-theme='dark'])) .num.aktif {
			color: var(--surface-sunken);
		}
	}
	.gap {
		padding: 0 4px;
		color: var(--text-3);
		font-size: 13px;
	}
	.jump {
		display: none;
		align-items: center;
		gap: 6px;
	}
	.jump {
		min-width: 130px;
	}
	.jump :global(.trigger) {
		min-height: 32px;
		font-size: 13px;
	}
	@media (max-width: 720px) {
		.nums {
			display: none;
		}
		.jump {
			display: flex;
			order: -1;
			width: 100%;
			justify-content: center;
		}
		.prev,
		.next {
			flex: 1 1 auto;
			min-height: 40px;
		}
	}
</style>
