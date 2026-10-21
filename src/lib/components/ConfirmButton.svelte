<script lang="ts">
	// Tombol submit untuk aksi destruktif: klik pertama mengganti label jadi
	// konfirmasi (5 detik), klik kedua baru benar-benar men-submit.
	let {
		pesan = 'Klik lagi untuk konfirmasi',
		label,
		class: cls = 'btn btn-sm btn-danger',
		mulai = false
	}: {
		pesan?: string;
		label: string;
		class?: string;
		mulai?: boolean;
	} = $props();

	let konfirmasi = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function onclick(e: MouseEvent) {
		if (!konfirmasi) {
			e.preventDefault();
			konfirmasi = true;
			clearTimeout(timer);
			timer = setTimeout(() => (konfirmasi = false), 5000);
		}
	}

	$effect(() => () => clearTimeout(timer));
</script>

<button
	type="submit"
	class={cls}
	onclick={onclick}
	aria-live="polite"
	data-mulai={mulai ? '' : undefined}>{konfirmasi ? pesan : label}</button
>

<style>
	button {
		min-width: 0;
	}
</style>
