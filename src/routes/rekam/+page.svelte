<script lang="ts">
	import PejabatPicker from '#lib/components/PejabatPicker.svelte';
	import NumberField from '#lib/components/NumberField.svelte';

	let { data, form } = $props();
	let mengirim = $state(false);
	const pejabat = $derived(data.pejabat as Array<Record<string, unknown>>);
	const terpilihAwal = $derived((data.terpilih as Record<string, unknown> | null) ?? null);
	const tahunIni = new Date().getFullYear();
	// Cukup untuk konteks; ukuran dihitung sederhana.
	let uraianPanjang = $state(0);
</script>

<svelte:head>
	<title>Tambah rekam jejak - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section narrow">
	<h1>Tambah rekam jejak</h1>
	<p class="small muted intro">
		Catat skandal, dugaan pelanggaran, atau rapor kerja seorang pejabat — <strong>dengan sumber berita</strong>.
		Entri langsung tayang; yang tidak bersumber bisa dilaporkan dan ditarik.
	</p>

	{#if form?.ok}
		<div class="card notice notice-info">
			<div>
				<p class="small">
					<strong>Tersimpan.</strong> Entri ini sekarang muncul di bagian “Rekam jejak” pada profil.
				</p>
				{#if form.slug}
					<a class="btn btn-secondary btn-sm" href={`/pejabat/${form.slug}`}>Lihat profil →</a>
				{/if}
			</div>
		</div>
	{:else}
		{#if form?.message}<p class="notice notice-error tiny" role="alert">{form.message}</p>{/if}
		<form
			method="POST"
			class="card form"
			onsubmit={(e) => {
				if (mengirim) e.preventDefault();
				else mengirim = true;
			}}
		>
			<PejabatPicker {pejabat} awal={terpilihAwal} />

			<div class="fgroup">
				<label class="label" for="judul">Judul peristiwa <span class="req">wajib</span></label>
				<input
					class="input"
					id="judul"
					name="judul"
					required
					placeholder="Contoh: Dugaan pelanggaran etik soal wisuda kampus"
				/>
			</div>

			<div class="fgroup">
				<label class="label" for="uraian">Uraian singkat <span class="muted">(opsional)</span></label>
				<textarea
					class="input"
					id="uraian"
					name="uraian"
					rows="3"
					maxlength="1200"
					oninput={(e) => (uraianPanjang = e.currentTarget.value.length)}
					placeholder="Apa yang terjadi, siapa yang menangani, apa statusnya sekarang…"></textarea>
				<p class="helper">{uraianPanjang}/1200</p>
			</div>

			<div class="two">
				<NumberField
					name="tahun"
					id="tahun"
					label="Tahun"
					min={1990}
					max={tahunIni}
					placeholder={String(tahunIni)}
					required
				/>
				<div class="fgroup">
					<label class="label" for="sumber_url">Tautan berita</label>
					<input class="input" id="sumber_url" name="sumber_url" type="url" required placeholder="https://…" />
				</div>
			</div>

			<p class="tiny muted rule">
				Tulis netral dan faktual. Sebutkan status (baru dilaporkan, sedang diperiksa, sudah divonis) —
				jangan menyimpulkan sendiri.
			</p>

			<button class="btn" type="submit" disabled={mengirim}>
				{mengirim ? 'Menyimpan…' : 'Tambahkan'}
			</button>
		</form>
	{/if}
</section>

<style>
	.intro {
		margin: 8px 0 18px;
		max-width: 62ch;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 18px;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.req {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--danger);
		margin-left: 4px;
	}
	.rule {
		margin: -4px 0 0;
		padding: 10px 12px;
		background: var(--n-50);
		border-left: 2px solid var(--line-strong);
		border-radius: 0 var(--radius) var(--radius) 0;
	}
	.form .btn {
		width: 100%;
	}
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
