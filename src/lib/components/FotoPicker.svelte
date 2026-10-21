<script lang="ts">
	// Pemilih foto pejabat dari Wikimedia Commons.
	// Alurnya: cari (server yang query Wikidata) → pilih satu kandidat →
	// URL foto diisi ke input tersembunyi yang ikut terkirim di form sunting.
	import PejabatAvatar from './PejabatAvatar.svelte';
	import Select from './Select.svelte';

	let {
		nama,
		fotoAwal = null
	}: { nama: string; fotoAwal?: string | null } = $props();

	type Kandidat = {
		qid: string;
		label: string;
		deskripsi: string | null;
		foto: string | null;
		fotoAsli: string | null;
		wikipedia: string | null;
	};

	let memuat = $state(false);
	let galat = $state<string | null>(null);
	let kandidat = $state<Kandidat[]>([]);
	let dipilih = $state<string>('');
	let sudahCari = $state(false);

	const salahSatu = $derived(kandidat.find((k) => k.qid === dipilih) ?? null);
	const foto = $derived(salahSatu?.foto ?? fotoAwal);

	async function cari() {
		memuat = true;
		galat = null;
		sudahCari = true;
		try {
			const r = await fetch(`/api/foto?nama=${encodeURIComponent(nama)}`);
			const d = (await r.json()) as { kandidat?: Kandidat[]; error?: string | null };
			kandidat = d.kandidat ?? [];
			if (d.error) galat = d.error;
			// Pilih otomatis kalau hanya ada satu hasil dengan foto.
			const berfoto = kandidat.filter((k) => k.foto);
			dipilih = berfoto.length === 1 ? berfoto[0].qid : '';
		} catch {
			galat = 'Gagal menghubungi pencarian foto.';
		} finally {
			memuat = false;
		}
	}

	const opsi = $derived(
		kandidat.map((k) => ({
			value: k.qid,
			label: `${k.label}${k.deskripsi ? ` — ${k.deskripsi}` : ''}${k.foto ? '' : ' (tanpa foto)'}`
		}))
	);
</script>

<div class="pemilih">
	<div class="atas">
		<PejabatAvatar {nama} foto={foto} ukuran={64} />
		<div class="teks">
			<p class="label">Foto profil</p>
			<p class="helper">
				Diambil dari Wikimedia Commons lewat Wikidata. <strong>Periksa dulu</strong> apakah orangnya
				benar sebelum menyimpan — nama pejabat sering kembar.
			</p>
		</div>
	</div>

	<div class="aksi">
		<button class="btn btn-secondary btn-sm" type="button" onclick={cari} disabled={memuat}>
			{memuat ? 'Mencari…' : fotoAwal ? 'Cari foto lain' : 'Cari foto di Wikipedia'}
		</button>
		{#if salahSatu?.wikipedia}
			<a class="btn btn-ghost btn-sm" href={salahSatu.wikipedia} target="_blank" rel="noopener noreferrer"
				>Buka Wikipedia ↗</a
			>
		{/if}
	</div>

	{#if galat}
		<p class="notice notice-error tiny" role="alert">{galat}</p>
	{:else if sudahCari && kandidat.length === 0 && !memuat}
		<p class="notice tiny">Tidak ada hasil di Wikidata untuk nama ini. Foto bisa diisi manual di bawah.</p>
	{/if}

	{#if opsi.length > 0}
		<div class="fgroup">
			<Select
				name="__pilih_foto"
				label="Kandidat"
				placeholder="Pilih orang yang benar…"
				options={opsi}
				value={dipilih}
				onchange={(v) => (dipilih = v)}
			/>
		</div>
	{/if}

	<div class="fgroup">
		<label class="label" for="foto_url">URL foto</label>
		<input
			class="input"
			id="foto_url"
			name="foto_url"
			type="url"
			value={foto ?? ''}
			placeholder="https://upload.wikimedia.org/…"
		/>
		<p class="helper">
			Terisi otomatis saat memilih kandidat. Kosongkan untuk menghapus foto. Hanya tautan
			<code>https</code> dari Wikimedia/Commons yang disarankan.
		</p>
	</div>
</div>

<style>
	.pemilih {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface-sunken);
	}
	.atas {
		display: flex;
		align-items: flex-start;
		gap: 14px;
	}
	.teks {
		min-width: 0;
	}
	.teks .label {
		margin: 0 0 4px;
	}
	.aksi {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.fgroup {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
</style>
