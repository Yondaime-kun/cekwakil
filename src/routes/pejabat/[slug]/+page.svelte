<script lang="ts">
	import { fmtDate, fmtRp } from '#lib/utils';

	let { data } = $props();
	const person = $derived(data.person as Record<string, unknown>);
	const pernyataan = $derived(data.pernyataan as Array<Record<string, unknown>>);
	const kasus = $derived(data.kasus as Array<Record<string, unknown>>);
	const harta = $derived((data.harta as Array<Record<string, unknown>>) ?? []);
	const rekam = $derived((data.rekam as Array<Record<string, unknown>>) ?? []);
	const jumlahHarta = $derived(data.jumlahHarta as number);
	const totalNominal = $derived(kasus.reduce((acc, k) => acc + (Number(k.nominal_rp) || 0), 0));
</script>

<svelte:head>
	<title>{person.nama} - CekWakil</title>
	<meta
		name="description"
		content="Arsip pernyataan {person.nama}, {person.jabatan}{person.partai ? ` ${person.partai}` : ''}."
	/>
</svelte:head>

<section class="container section">
	<header class="profile-head">
		<div class="profile-main">
			<h1>{person.nama}</h1>
			<p class="role">{person.jabatan}</p>
			<ul class="facts">
				{#if person.partai}
					<li>
						<span class="fact-label">Partai</span>
						<span class="fact-value">{person.partai}</span>
					</li>
				{/if}
				{#if person.dapil}
					<li>
						<span class="fact-label">Dapil</span>
						<span class="fact-value">{person.dapil}</span>
					</li>
				{/if}
				{#if person.komisi}
					<li>
						<span class="fact-label">Komisi</span>
						<span class="fact-value">{person.komisi}</span>
					</li>
				{/if}
				{#if person.suara}
					<li>
						<span class="fact-label">Perolehan suara</span>
						<span class="fact-value num">{Number(person.suara).toLocaleString('id-ID')}</span>
					</li>
				{/if}
				<li>
					<span class="fact-label">Instansi</span>
					<span class="fact-value">{person.instansi}</span>
				</li>
				{#if harta.length > 0}
					<li>
						<span class="fact-label">Harta (LHKPN terakhir)</span>
						<span class="fact-value num">{harta[0].total_harta ? fmtRp(Number(harta[0].total_harta)) : 'belum dilaporkan'}</span>
						<a class="tiny" href={`/pejabat/${person.slug}#harta`}>Riwayat LHKPN ({jumlahHarta})</a>
					</li>
				{:else}
					<li>
						<span class="fact-label">Harta (LHKPN)</span>
						<span class="fact-value muted">belum ada entri</span>
						<a class="tiny" href="/harta">Tambahkan</a>
					</li>
				{/if}
			</ul>
			{#if person.bio}
				<p class="bio">{person.bio}</p>
				{#if person.sumber_bio}
					<a class="tiny" href={String(person.sumber_bio)} target="_blank" rel="noopener noreferrer">Sumber bio</a>
				{/if}
			{/if}
			<p class="editlink tiny">
				<a href={`/pejabat/${person.slug}/edit`}>Sunting profil ini</a>
				<span class="muted"> · </span>
				<a href="/rekam">Tambah rekam jejak</a>
				<span class="muted"> · </span>
				<a href="/harta">Tambah LHKPN</a>
			</p>
			{#if person.wikipedia_url}
				<p class="small">
					<a href={String(person.wikipedia_url)} target="_blank" rel="noopener noreferrer"
						>Profil Wikipedia</a
					>
				</p>
			{/if}
		</div>
		<div class="scorecard">
			<div class="score">
				<span class="score-num">{pernyataan.length}</span>
				<span class="score-lbl">Pernyataan terarsip</span>
			</div>
			{#if kasus.length > 0}
				<div class="score score-danger">
					<span class="score-num">{kasus.length}</span>
					<span class="score-lbl">Kasus korupsi</span>
				</div>
			{/if}
		</div>
	</header>

	{#if kasus.length > 0}
		<section class="kasus-block">
			<div class="block-head">
				<h2>Kasus korupsi</h2>
				{#if totalNominal > 0}
					<span class="total">Total tercatat {fmtRp(totalNominal)}</span>
				{/if}
			</div>
			<ul class="kasus-list">
				{#each kasus as k (k.id)}
					<li class="kasus">
						<div class="kasus-top">
							<h3 class="kasus-name">{k.nama_kasus}</h3>
							{#if k.nominal_rp}
								<span class="kasus-nominal num">{fmtRp(Number(k.nominal_rp))}</span>
							{/if}
						</div>
						<p class="kasus-meta tiny">
							{#if k.peran}<span class="status status-error">{k.peran}</span>{/if}
							{#if k.status}<span class="status">{k.status}</span>{/if}
							{#if k.tahun}<span class="muted">{k.tahun}</span>{/if}
						</p>
						<a class="tiny" href={String(k.sumber_url)} target="_blank" rel="noopener noreferrer"
							>Sumber berita</a
						>
					</li>
				{/each}
			</ul>
			<p class="disclaimer tiny muted">
				Status hukum bisa berubah. Selalu cek sumber terbaru sebelum menyimpulkan.
			</p>
		</section>
	{/if}

	{#if harta.length > 0}
		<section class="harta-block" id="harta">
			<div class="block-head">
				<h2>Riwayat LHKPN</h2>
				<a class="tiny" href="/harta">Tambah laporan</a>
			</div>
			<table class="hartatable">
				<thead>
					<tr><th>Tahun</th><th>Total harta</th><th></th></tr>
				</thead>
				<tbody>
					{#each harta as h (h.tahun)}
						<tr>
							<td class="num">{h.tahun}</td>
							<td class="num">{h.total_harta ? fmtRp(Number(h.total_harta)) : '—'}</td>
							<td>
								{#if h.lhkpn_url}
									<a class="tiny" href={String(h.lhkpn_url)} target="_blank" rel="noopener noreferrer">dokumen</a>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="disclaimer tiny muted">
				Angka dari LHKPN yang dilaporkan publik. Periksa dokumen asli sebelum mengutip.
			</p>
		</section>
	{/if}

	{#if rekam.length > 0}
		<section class="rekam-block">
			<div class="block-head">
				<h2>Rekam jejak</h2>
			</div>
			<ul class="rekam-list">
				{#each rekam as r (r.id)}
					<li class="rekam">
						<h3 class="rekam-name">
							{r.judul}{#if r.tahun}<span class="muted"> · {r.tahun}</span>{/if}
						</h3>
						{#if r.uraian}<p class="small">{r.uraian}</p>{/if}
						<a class="tiny" href={String(r.sumber_url)} target="_blank" rel="noopener noreferrer">Sumber berita</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="pernyataan-block">
		<div class="block-head">
			<h2>Pernyataan terarsip</h2>
		</div>

		{#if pernyataan.length === 0}
			<div class="empty-inline">
				<p class="small">
					<strong>Belum ada pernyataan terarsip untuk {person.nama}.</strong>
					Tahu ada yang terlewat? <a href="/submit">Laporkan di sini</a> dengan kutipan dan tautan
					beritanya.
				</p>
			</div>
		{:else}
			<ul class="entries">
				{#each pernyataan as p (p.id)}
					<li class="entry">
						<div class="entry-head">
							<span class="chip">{p.kategori}</span>
							<span class="tiny muted num">{fmtDate(String(p.tanggal))}</span>
						</div>
						<blockquote>{p.isi}</blockquote>
						{#if p.konteks}<p class="small muted konteks">{p.konteks}</p>{/if}
						<p class="tiny srcrow">
							<a href={String(p.sumber_url)} target="_blank" rel="noopener noreferrer">Sumber berita</a>
							{#if p.arsip_url}
								<span class="muted"> / </span>
								<a href={String(p.arsip_url)} target="_blank" rel="noopener noreferrer">Arsip</a>
							{/if}
						</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</section>

<style>
	.profile-head {
		display: flex;
		justify-content: space-between;
		gap: 32px;
		flex-wrap: wrap;
		padding-bottom: 28px;
		border-bottom: 1px solid var(--line);
	}
	.profile-main {
		flex: 1 1 380px;
		min-width: 0;
	}
	.role {
		margin-top: 6px;
		font-size: 16px;
		color: var(--text-2);
	}
	.facts {
		list-style: none;
		margin: 18px 0 12px;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 12px 24px;
	}
	.facts li {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.fact-label {
		font-size: 12px;
		color: var(--text-3);
	}
	.fact-value {
		font-size: 14.5px;
		font-weight: 560;
	}
	.scorecard {
		display: flex;
		gap: 28px;
		align-items: flex-start;
	}
	.score {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.score-num {
		font-size: 34px;
		font-weight: 660;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		color: var(--accent);
	}
	.score-lbl {
		font-size: 12.5px;
		color: var(--text-2);
		white-space: nowrap;
	}
	.score-danger .score-num {
		color: var(--danger);
	}
	.kasus-block {
		margin-top: 32px;
		padding: 20px;
		background: var(--danger-soft);
		border: 1px solid var(--danger-line);
		border-radius: var(--radius-lg);
	}
	.block-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.total {
		font-size: 13px;
		font-weight: 580;
		color: var(--danger);
	}
	.kasus-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.kasus {
		padding: 14px 0;
		border-top: 1px solid var(--danger-line);
	}
	.kasus:first-child {
		border-top: none;
		padding-top: 0;
	}
	.kasus-top {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		align-items: baseline;
	}
	.kasus-name {
		font-size: 15.5px;
		font-weight: 620;
	}
	.kasus-nominal {
		font-size: 15px;
		font-weight: 660;
		color: var(--danger);
		white-space: nowrap;
	}
	.kasus-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		margin: 6px 0;
	}
	.disclaimer {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--danger-line);
	}
	.hartatable {
		width: 100%;
		border-collapse: collapse;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		overflow: hidden;
		font-size: 14.5px;
	}
	.hartatable th {
		text-align: left;
		padding: 10px 14px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-3);
		border-bottom: 1px solid var(--line);
	}
	.hartatable td {
		padding: 10px 14px;
		border-bottom: 1px solid var(--line);
	}
	.hartatable tr:last-child td {
		border-bottom: none;
	}
	.rekam-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.rekam {
		padding: 14px 16px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.rekam-name {
		font-size: 15px;
		font-weight: 620;
		margin-bottom: 6px;
	}
	.bio {
		margin-top: 14px;
		font-size: 15px;
		line-height: 1.65;
		color: var(--text-2);
		max-width: 70ch;
	}
	.editlink {
		margin-top: 12px;
	}
	.editlink a {
		color: var(--muted);
	}
	.pernyataan-block {
		margin-top: 32px;
	}
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.entry {
		padding: 18px 20px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.entry-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}
	blockquote {
		margin: 0 0 10px;
		padding-left: 14px;
		border-left: 2px solid var(--accent-line);
		font-size: 16px;
		line-height: 1.6;
	}
	.konteks {
		margin-bottom: 10px;
	}
	.srcrow {
		margin: 0;
	}
	.empty h3 {
		margin-bottom: 8px;
	}
	.empty-inline {
		padding: 16px 18px;
		background: var(--n-0);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	@media (max-width: 720px) {
		.profile-head {
			gap: 20px;
		}
		.scorecard {
			gap: 24px;
		}
		.score-num {
			font-size: 28px;
		}
		.kasus-block {
			padding: 16px;
		}
		blockquote {
			font-size: 15.5px;
		}
	}
</style>
