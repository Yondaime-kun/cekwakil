<script lang="ts">
	import { fmtRp } from '#lib/utils';

	let { data, form } = $props();
	let mengirim = $state(false);
	const list = $derived(data.list as Array<Record<string, unknown>>);
	const pejabat = $derived(data.pejabat as Array<Record<string, unknown>>);
	let cari = $state('');
	const hasil = $derived(
		cari.trim().length < 2
			? []
			: pejabat.filter((p) => String(p.nama).toLowerCase().includes(cari.toLowerCase())).slice(0, 8)
	);
	let dipilih = $state<Record<string, unknown> | null>(null);
</script>

<svelte:head>
	<title>Harta pejabat (LHKPN) - CekWakil</title>
	<meta
		name="description"
		content="Catatan harta kekayaan pejabat publik Indonesia berdasarkan LHKPN, diisi dan diperiksa bersama." />
</svelte:head>

<section class="container section narrow">
	<h1>Harta pejabat</h1>
	<p class="small muted intro">
		Angka harta dari LHKPN (Laporan Harta Kekayaan Penyelenggara Negara). Siapa pun bisa menambah
		entri — wajib menyertakan tautan dokumen aslinya agar bisa diperiksa.
	</p>

	{#if form?.ok}
		<div class="card notice ok">
			<p class="small"><strong>Tersimpan.</strong> Entri harta langsung tayang di daftar di bawah.</p>
		</div>
	{:else}
		<form method="POST" class="card form" onsubmit={(e) => { if (mengirim) e.preventDefault(); else mengirim = true; }}>
			{#if form?.message}<p class="small err">{form.message}</p>{/if}

			<div class="fgroup">
				<span class="label">Pejabat</span>
				<input type="hidden" name="pejabat_id" value={dipilih ? dipilih.id : ''} />
				<input
					class="input"
					type="search"
					placeholder="Ketik nama pejabat..."
					bind:value={cari}
					oninput={() => (dipilih = null)} />
				{#if dipilih}
					<p class="helper">Dipilih: <strong>{dipilih.nama}</strong></p>
				{:else if hasil.length > 0}
					<ul class="hasil">
						{#each hasil as p (p.id)}
							<li>
								<button
									type="button"
									onclick={() => {
										dipilih = p;
										cari = String(p.nama);
									}}>{p.nama}</button
								>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="two">
				<div class="fgroup">
					<label class="label" for="tahun">Tahun laporan</label>
					<input class="input" id="tahun" name="tahun" type="number" min="2000" max="2100" required />
				</div>
				<div class="fgroup">
					<label class="label" for="total_harta">Total harta (Rp)</label>
					<input class="input" id="total_harta" name="total_harta" inputmode="numeric" required />
				</div>
			</div>

			<div class="fgroup">
				<label class="label" for="lhkpn_url">Tautan dokumen LHKPN</label>
				<input
					class="input"
					id="lhkpn_url"
					name="lhkpn_url"
					type="url"
					required
					placeholder="https://elhkpn.kpk.go.id/..." />
				<p class="helper">Wajib. Tanpa dokumen asli, angka tidak bisa diverifikasi.</p>
			</div>

			<button class="btn" type="submit" disabled={mengirim}>{mengirim ? "Menyimpan..." : "Tambahkan"}</button>
		</form>
	{/if}

	<h2 class="listhead">Entri terbaru</h2>
	{#if list.length === 0}
		<div class="card"><p class="small muted">Belum ada entri harta.</p></div>
	{:else}
		<ul class="hlist">
			{#each list as h (h.id)}
				<li class="hrow">
					<span class="hnama"><a href={`/pejabat/${h.slug}`}>{h.nama}</a></span>
					<span class="hmeta tiny muted">
						{h.tahun} · <span class="num">{h.total_harta ? fmtRp(Number(h.total_harta)) : '—'}</span>
						{#if h.lhkpn_url}
							· <a href={String(h.lhkpn_url)} target="_blank" rel="noopener noreferrer">dokumen</a>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.intro {
		margin: 8px 0 18px;
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
	.hasil {
		list-style: none;
		margin: 6px 0 0;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--n-25);
		max-height: 220px;
		overflow-y: auto;
	}
	.hasil button {
		width: 100%;
		text-align: left;
		padding: 9px 10px;
		border: none;
		border-radius: 6px;
		background: none;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}
	.hasil button:hover {
		background: var(--n-50);
	}
	.form .btn {
		width: 100%;
	}
	.notice {
		margin-bottom: 18px;
	}
	.err {
		color: var(--danger);
		margin: 0;
	}
	.listhead {
		font-size: 17px;
		margin: 26px 0 12px;
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
		background: var(--n-0);
		padding: 11px 14px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.hnama {
		font-size: 14.5px;
		font-weight: 580;
	}
	@media (max-width: 520px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
