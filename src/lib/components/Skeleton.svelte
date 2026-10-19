<script lang="ts">
	let { mode = 'list' }: { mode?: 'list' | 'pejabat' | 'profil' } = $props();
</script>

{#if mode === 'pejabat'}
	<div class="skeleton skel-sec" aria-hidden="true">
		<div class="skeleton skeleton-title"></div>
		<div class="skeleton skeleton-pill"></div>
		{#each Array(4) as _, i (i)}
			<div class="skeleton-card">
				<div class="skeleton skeleton-line w60"></div>
				<div class="skeleton skeleton-line"></div>
				<div class="skeleton skeleton-line w40"></div>
			</div>
		{/each}
	</div>
{:else if mode === 'profil'}
	<div class="skeleton skel-sec" aria-hidden="true">
		<div class="skeleton skeleton-title"></div>
		<div class="skeleton skeleton-line w40"></div>
		<div class="skeleton-card">
			<div class="skeleton skeleton-line w60"></div>
			<div class="skeleton skeleton-line"></div>
			<div class="skeleton skeleton-line"></div>
			<div class="skeleton skeleton-line w40"></div>
		</div>
		<div class="skeleton-card">
			<div class="skeleton skeleton-line w60"></div>
			<div class="skeleton skeleton-line"></div>
		</div>
	</div>
{:else}
	<div class="skeleton skel-sec" aria-hidden="true">
		<div class="skeleton skeleton-title"></div>
		{#each Array(3) as _, i (i)}
			<div class="skeleton-card">
				<div class="skeleton skeleton-line w60"></div>
				<div class="skeleton skeleton-line"></div>
				<div class="skeleton skeleton-line w40"></div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.skel-sec {
		min-height: 40vh;
	}
</style>
