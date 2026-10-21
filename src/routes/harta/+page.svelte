<script lang="ts">
	import { fmtRp } from '#lib/utils';
	import PejabatPicker from '#lib/components/PejabatPicker.svelte';
	import NumberField from '#lib/components/NumberField.svelte';

	let { data, form } = $props();
	let mengirim = $state(false);
	const list = $derived(data.list as Array<Record<string, unknown>>);
	const pejabat = $derived(data.pejabat as Array<Record<string, unknown>>);
	const terpilihAwal = $derived((data.terpilih as Record<string, unknown> | null) ?? null);

	// Format ribuan saat mengetik: "12450000000" -> "12.450.000.000".
	let total = $state('');
	function onTotal(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const angka = el.value.replace(/\D/g, '');
		total = angka ? Number(angka).toLocaleString('id-ID') : '';
	}

	const tahunIni = new Date().getFullYear();
</script>

<svelte:head>
	<title>Harta pejabat (LHKPN) - CekWakil</title>
	<meta
		name="description"
		content="Catatan harta kekayaan pejabat publik Indonesia dari LHKPN, diisi dan diperiksa bersama. Wajib tautan dokumen asli."
	/>
</svelte:head>

<section class="container section">
	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Transparansi</p>
			<h1>Harta pejabat</h1>
			<p class="sub muted">
				Angka dari LHKPN (Laporan Harta Kekayaan Penyelenggara Negara). Siapa pun bisa menambah
				entri — wajib menyertakan tautan dokumen aslinya.
			</p>
		</div>
	</header>

	<div class="layout">
		<div class="col-form">
			{#if form?.ok}
				<div class="card notice notice-info">
					<div>
						<p class="small">
							<strong>Tersimpan.</strong> Entri harta langsung tayang di daftar sebelah.
						</p>
						<p class="btnrow">
							<a class="btn btn-secondary btn-sm" href="/harta">Tambah lagi</a>
						</p>
					</div>
				</div>
			{:else}
				<form
					method="POST"
					class="card form"
					onsubmit={(e) => {
						if (mengirim) e.preventDefault();
						else mengirim = true;
					}}
				>
					<h2 class="h-form">Tambah entri LHKPN</h2>
					<p class="tiny muted formlede">
						Satu entri = satu tahun laporan untuk satu pejabat. Ambil angka dari dokumen resmi, bukan
						dari berita.
					</p>

					{#if form?.message}
						<p class="notice notice-error tiny" role="alert">{form.message}</p>
					{/if}

					<PejabatPicker {pejabat} awal={terpilihAwal} />

					<div class="two">
						<NumberField
							name="tahun"
							id="tahun"
							label="Tahun laporan"
							min={2000}
							max={tahunIni + 1}
							placeholder={String(tahunIni)}
							required
						/>
						<div class="fgroup">
							<label class="label" for="total_harta">Total harta</label>
							<div class="field-affix">
								<span class="affix">Rp</span>
								<input
									class="input"
									id="total_harta"
									name="total_harta"
									inputmode="numeric"
									required
									bind:value={total}
									oninput={onTotal}
									placeholder="12.450.000.000"
									aria-describedby="total-preview"
								/>
							</div>
						</div>
					</div>
					<p class="helper preview" id="total-preview">
						{#if total}
							≈ <strong>{fmtRp(Number(total.replace(/\D/g, '')))}</strong>
						{:else}
							Tulis angka saja, titik ribuan ditambahkan otomatis.
						{/if}
					</p>

					<div class="fgroup">
						<label class="label" for="lhkpn_url">Tautan dokumen LHKPN</label>
						<input
							class="input"
							id="lhkpn_url"
							name="lhkpn_url"
							type="url"
							required
							placeholder="https://elhkpn.kpk.go.id/…"
						/>
						<p class="helper">
							Wajib. Tanpa dokumen asli, angka tidak bisa diverifikasi dan bisa ditolak.
						</p>
					</div>

					<button class="btn" type="submit" disabled={mengirim}>
						{mengirim ? 'Menyimpan…' : 'Tambahkan entri'}
					</button>
				</form>
			{/if}
		</div>

		<div class="col-list">
			<div class="listhead">
				<h2 class="h-form">Entri terbaru</h2>
				<span class="tiny muted">{fmtRp(list.reduce((a, h) => a + (Number(h.total_harta) || 0), 0))} tercatat</span>
			</div>
			{#if list.length === 0}
				<div class="card"><p class="small muted">Belum ada entri harta. Jadilah yang pertama.</p></div>
			{:else}
				<ul class="hlist">
					{#each list as h (h.id)}
						<li class="hrow">
							<a class="hnama" href={`/pejabat/${h.slug}`}>{h.nama}</a>
							<div class="hmeta">
								<span class="chip num">{h.tahun}</span>
								<span class="num hval">{h.total_harta ? fmtRp(Number(h.total_harta)) : '—'}</span>
								{#if h.lhkpn_url}
									<a class="tiny" href={String(h.lhkpn_url)} target="_blank" rel="noopener noreferrer"
										>dokumen ↗</a
									>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>

<style>
	.pagehead {
		margin-bottom: 20px;
	}
	.crumb {
		margin: 0 0 6px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-weight: 600;
	}
	.sub {
		margin: 6px 0 0;
		font-size: 14px;
		max-width: 66ch;
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
		gap: 28px;
		align-items: start;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 18px;
	}
	.h-form {
		font-size: 17px;
	}
	.formlede {
		margin: -8px 0 0;
	}
	.two {
		display: grid;
		/* Kolom tahun cukup sempit; total harta butuh ruang lebih untuk
		   angka 13 digit + prefix Rp. */
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: 12px;
	}
	.preview {
		margin: -8px 0 0;
	}
	.field-affix .input {
		min-width: 0;
		padding-left: 8px;
		font-variant-numeric: tabular-nums;
	}
	.field-affix .affix {
		padding-left: 10px;
		font-size: 13.5px;
	}
	.form .btn {
		width: 100%;
	}
	.notice {
		margin-bottom: 0;
	}
	.btnrow {
		margin-top: 10px;
	}
	.listhead {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}
	.hlist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--line);
	}
	.hrow {
		background: var(--surface);
		padding: 11px 14px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.hnama {
		font-size: 14.5px;
		font-weight: 580;
		color: var(--text);
		text-decoration: none;
	}
	.hnama:hover {
		color: var(--accent);
		text-decoration: underline;
	}
	.hmeta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
	}
	.hval {
		font-weight: 620;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
