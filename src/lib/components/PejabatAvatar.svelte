<script lang="ts">
	// Avatar pejabat: foto kalau ada, inisial kalau belum.
	// Foto dari Wikimedia Commons bisa 404 (dihapus), jadi error ditangani
	// dengan jatuh ke inisial, bukan kotak rusak.
	let {
		nama,
		foto,
		ukuran = 52,
		kelas = ''
	}: { nama: string; foto?: string | null; ukuran?: number; kelas?: string } = $props();

	let gagal = $state(false);
	$effect(() => {
		foto; // reset kalau sumber foto berganti
		gagal = false;
	});

	const inisial = $derived(
		nama
			.replace(/[^A-Za-z\s]/g, '')
			.trim()
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase())
			.join('')
	);
</script>

<div
	class="avatar {kelas}"
	style:width="{ukuran}px"
	style:height="{ukuran}px"
	style:font-size="{Math.round(ukuran * 0.35)}px"
	aria-hidden="true"
>
	{#if foto && !gagal}
		<img src={foto} alt="" loading="lazy" decoding="async" onerror={() => (gagal = true)} />
	{:else}
		{inisial}
	{/if}
</div>

<style>
	.avatar {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		overflow: hidden;
		border-radius: 50%;
		font-weight: 650;
		line-height: 1;
		color: var(--accent);
		background: var(--accent-soft);
		border: 1px solid var(--accent-line);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
