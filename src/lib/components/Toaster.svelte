<script lang="ts">
	import { toasts } from '#lib/toast';
</script>

<div class="toaster" aria-live="polite" aria-atomic="false">
	{#each $toasts as t (t.id)}
		<p class="toast" class:err={t.jenis === 'error'} role={t.jenis === 'error' ? 'alert' : 'status'}>
			{t.pesan}
		</p>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		left: 50%;
		bottom: max(20px, env(safe-area-inset-bottom));
		transform: translateX(-50%);
		z-index: 120;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		pointer-events: none;
		width: max-content;
		max-width: calc(100vw - 32px);
	}
	.toast {
		margin: 0;
		padding: 9px 16px;
		font-size: 13.5px;
		font-weight: 560;
		color: var(--n-0);
		background: var(--n-900);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-pop);
		animation: rise 160ms var(--ease);
	}
	/* Di dark mode --n-900 itu teks terang, jadi balik. */
:global(:root[data-theme='dark']) .toast {
		color: #0e1412;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='light']):not([data-theme='dark'])) .toast {
			color: #0e1412;
		}
	}
	.toast.err {
		background: var(--danger);
		color: #fff;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
</style>
