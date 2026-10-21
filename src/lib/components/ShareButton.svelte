<script lang="ts">
	import { page } from '$app/state';
	import { toast } from '#lib/toast';

	// Salin tautan entri/bagian. Fallback ke prompt kalau clipboard diblokir
	// (browser non-HTTPS, atau izin ditolak), supaya tetap bisa dipakai.
	let { hash = '', label = 'Bagikan', compact = false }: {
		hash?: string;
		label?: string;
		compact?: boolean;
	} = $props();

	let sedang = $state(false);

	async function salin() {
		const url = `${page.url.origin}${page.url.pathname}${hash}`;
		sedang = true;
		try {
			if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
				await navigator.share({ url, title: document.title });
				return;
			}
			await navigator.clipboard.writeText(url);
			toast('Tautan disalin');
		} catch {
			toast('Tidak bisa menyalin otomatis', 'error');
		} finally {
			sedang = false;
		}
	}
</script>

<button class="btn btn-secondary btn-sm share" type="button" onclick={salin} disabled={sedang}>
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

<style>
	.share {
		gap: 6px;
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
