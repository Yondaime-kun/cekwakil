<script lang="ts">
	import Select from '#lib/components/Select.svelte';
	import PejabatAvatar from '#lib/components/PejabatAvatar.svelte';
	import { goto } from '$app/navigation';
	import { fmtRp, fmtDate } from '#lib/utils';

	let { data } = $props();

	type Profil = {
		id: number;
		nama: string;
		slug: string;
		jabatan: string;
		partai: string | null;
		dapil: string | null;
		komisi: string | null;
		suara: number | null;
		foto_url: string | null;
		bio: string | null;
		jumlah_kutipan: number;
		jumlah_kasus: number;
		nominal_kasus: number;
		harta_terakhir: number | null;
		tahun_harta: number | null;
	};

	const a = $derived(data.a as Profil | null);
	const b = $derived(data.b as Profil | null);
	const kA = $derived(data.kA as Array<{ id: number; isi: string; kategori: string; tanggal: string }>);
	const kB = $derived(data.kB as Array<{ id: number; isi: string; kategori: string; tanggal: string }>);

	const semua = $derived(
		(data.semua as Array<{ slug: string; nama: string; partai: string | null }>).map((p) => ({
			value: p.slug,
			label: p.partai ? `${p.nama} — ${p.partai}` : p.nama
		}))
	);

	// Nilai awal disalin sekali (dari URL); setelah pengguna memilih, state
	// ini milik komponen. svelte-ignore di baris berikutnya sengaja.
	// svelte-ignore state_referenced_locally
	let pilihA = $state(a?.slug ?? '');
	// svelte-ignore state_referenced_locally
	let pilihB = $state(b?.slug ?? '');

	$effect(() => {
		pilihA = a?.slug ?? '';
		pilihB = b?.slug ?? '';
	});

	function terapkan() {
		const q = new URLSearchParams();
		if (pilihA) q.set('a', pilihA);
		if (pilihB) q.set('b', pilihB);
		goto(`/banding${q.toString() ? `?${q}` : ''}`);
	}

	const siap = $derived(!!a && !!b);

	// Baris perbandingan. `angka` memakai teks supaya "—" tetap terbaca,
	// dan `banding` menandai mana yang lebih tinggi (bukan "lebih baik").
	type Baris = {
		label: string;
		a: string;
		b: string;
		na?: number;
		nb?: number;
	};

	const baris = $derived.by<Baris[]>(() => {
		if (!a || !b) return [];
		return [
			{ label: 'Jabatan', a: a.jabatan, b: b.jabatan },
			{ label: 'Partai', a: a.partai ?? '—', b: b.partai ?? '—' },
			{ label: 'Dapil', a: a.dapil ?? '—', b: b.dapil ?? '—' },
			{ label: 'Komisi', a: a.komisi ?? '—', b: b.komisi ?? '—' },
			{
				label: 'Perolehan suara',
				a: a.suara ? a.suara.toLocaleString('id-ID') : '—',
				b: b.suara ? b.suara.toLocaleString('id-ID') : '—',
				na: a.suara ?? 0,
				nb: b.suara ?? 0
			},
			{
				label: 'Kutipan terarsip',
				a: String(a.jumlah_kutipan),
				b: String(b.jumlah_kutipan),
				na: a.jumlah_kutipan,
				nb: b.jumlah_kutipan
			},
			{
				label: 'Kasus tercatat',
				a: String(a.jumlah_kasus),
				b: String(b.jumlah_kasus),
				na: a.jumlah_kasus,
				nb: b.jumlah_kasus
			},
			{
				label: 'Nominal kasus',
				a: a.nominal_kasus ? fmtRp(Number(a.nominal_kasus)) : '—',
				b: b.nominal_kasus ? fmtRp(Number(b.nominal_kasus)) : '—',
				na: Number(a.nominal_kasus),
				nb: Number(b.nominal_kasus)
			},
			{
				label: 'Harta terakhir (LHKPN)',
				a: a.harta_terakhir ? `${fmtRp(Number(a.harta_terakhir))} (${a.tahun_harta})` : '—',
				b: b.harta_terakhir ? `${fmtRp(Number(b.harta_terakhir))} (${b.tahun_harta})` : '—',
				na: Number(a.harta_terakhir ?? 0),
				nb: Number(b.harta_terakhir ?? 0)
			}
		];
	});
</script>

<svelte:head>
	<title>{siap ? `${a?.nama} vs ${b?.nama}` : 'Bandingkan pejabat'} - CekWakil</title>
	<meta
		name="description"
		content="Bandingkan dua pejabat publik: partai, dapil, komisi, perolehan suara, kutipan terarsip, kasus, dan harta kekayaan."
	/>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<section class="container section">
	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Alat</p>
			<h1>Bandingkan</h1>
			<p class="sub muted">
				Letakkan dua pejabat berdampingan: identitas, angka, dan kutipan terakhirnya. Angka yang lebih
				besar ditandai — itu bukan penilaian, cuma pembanding.
			</p>
		</div>
	</header>

	<form class="pilih card" onsubmit={(e) => { e.preventDefault(); terapkan(); }}>
		<div class="dua">
			<Select
				name="a"
				label="Pejabat pertama"
				placeholder="Pilih pejabat…"
				options={semua}
				value={pilihA}
				onchange={(v) => (pilihA = v)}
			/>
			<Select
				name="b"
				label="Pejabat kedua"
				placeholder="Pilih pejabat…"
				options={semua}
				value={pilihB}
				onchange={(v) => (pilihB = v)}
			/>
		</div>
		<button class="btn" type="submit" disabled={!pilihA || !pilihB || pilihA === pilihB}>
			Bandingkan
		</button>
	</form>

	{#if pilihA && pilihB && pilihA === pilihB}
		<p class="notice notice-warn tiny">Pilih dua pejabat yang berbeda.</p>
	{/if}

	{#if siap && a && b}
		<div class="hasil">
			<div class="kepala">
				<div></div>
				{#each [a, b] as p (p.id)}
					<a class="orang" href={`/pejabat/${p.slug}`}>
						<PejabatAvatar nama={p.nama} foto={p.foto_url} ukuran={48} />
						<span class="nm">{p.nama}</span>
					</a>
				{/each}
			</div>

			{#each baris as r (r.label)}
				<div class="baris">
					<span class="lbl">{r.label}</span>
					<span
						class="val num"
						class:tinggi={(r.na ?? -1) > (r.nb ?? -1) && (r.na ?? 0) !== (r.nb ?? 0)}
						><span class="who">{a.nama}</span><span class="angka">{r.a}</span></span
					>
					<span
						class="val num"
						class:tinggi={(r.nb ?? -1) > (r.na ?? -1) && (r.na ?? 0) !== (r.nb ?? 0)}
						><span class="who">{b.nama}</span><span class="angka">{r.b}</span></span
					>
				</div>
			{/each}
		</div>

		<div class="kutipan-grid">
			{#each [{ p: a, ks: kA }, { p: b, ks: kB }] as { p, ks } (p.id)}
				<section class="kutipan-blok">
					<h2>{p.nama}</h2>
					{#if ks.length === 0}
						<p class="tiny muted">Belum ada kutipan terarsip.</p>
					{:else}
						<ul>
							{#each ks as k (k.id)}
								<li>
									<p class="kisi">{k.isi}</p>
									<p class="tiny muted">
										<span class="tag">{k.kategori}</span>
										<span class="num">{fmtDate(k.tanggal)}</span>
									</p>
								</li>
							{/each}
						</ul>
					{/if}
					{#if p.jumlah_kutipan > ks.length}
						<a class="tiny" href={`/pejabat/${p.slug}#pernyataan`}
							>Lihat semua {p.jumlah_kutipan} kutipan →</a
						>
					{/if}
				</section>
			{/each}
		</div>

		<p class="legal tiny muted">
			Status hukum dapat berubah dan peran berbeda-beda (tersangka ≠ terpidana). Angka berasal dari
			arsip yang bisa ditelusuri — buka sumber masing-masing sebelum menyimpulkan.
		</p>
	{:else if !siap}
		<div class="kosong card">
			<p class="small">
				<strong>Belum ada yang dibandingkan.</strong> Pilih dua pejabat di atas, atau buka profil siapa pun
				lalu tekan “Bandingkan”.
			</p>
		</div>
	{/if}
</section>

<style>
	.pagehead {
		padding-bottom: 20px;
		margin-bottom: 22px;
		border-bottom: 1px solid var(--line);
	}
	h1 {
		margin: 4px 0 0;
		font-size: clamp(30px, 4vw, 44px);
		font-weight: 660;
		letter-spacing: -0.035em;
	}
	.sub {
		margin: 8px 0 0;
		font-size: 14.5px;
		max-width: 64ch;
	}

	.pilih {
		display: flex;
		align-items: flex-end;
		gap: 14px;
		padding: 16px;
		margin-bottom: 18px;
	}
	.dua {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.hasil {
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--surface);
		margin-bottom: 24px;
	}
	.kepala {
		display: grid;
		grid-template-columns: minmax(120px, 0.9fr) 1fr 1fr;
		gap: 8px;
		padding: 14px 16px;
		background: var(--surface-sunken);
		border-bottom: 1px solid var(--line);
	}
	.orang {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: inherit;
		min-width: 0;
	}
	.orang .nm {
		font-weight: 650;
		font-size: 15px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.orang:hover .nm {
		color: var(--accent);
		text-decoration: underline;
	}

	.baris {
		display: grid;
		grid-template-columns: minmax(120px, 0.9fr) 1fr 1fr;
		gap: 8px;
		padding: 11px 16px;
		border-bottom: 1px solid var(--line);
		align-items: baseline;
	}
	.baris:last-child {
		border-bottom: none;
	}
	.baris:nth-child(even) {
		background: var(--surface-sunken);
	}
	.lbl {
		font-size: 12.5px;
		color: var(--text-3);
	}
	.val {
		font-size: 14px;
		font-weight: 500;
		overflow-wrap: anywhere;
	}
	.val.tinggi {
		font-weight: 700;
		color: var(--accent);
	}
	/* Label nama hanya dipakai di tata letak mobile (lihat media query). */
	.who {
		display: none;
	}

	.kutipan-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
		margin-bottom: 22px;
	}
	.kutipan-blok {
		min-width: 0;
	}
	.kutipan-blok h2 {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-2);
		padding-bottom: 8px;
		border-bottom: 1px solid var(--line);
		margin-bottom: 10px;
	}
	.kutipan-blok ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.kisi {
		margin: 0 0 6px;
		padding-left: 12px;
		border-left: 3px solid var(--accent-line);
		font-size: 14px;
		line-height: 1.55;
	}
	.tag {
		margin-right: 8px;
	}

	.kosong {
		padding: 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.legal {
		max-width: 78ch;
	}

	@media (max-width: 760px) {
		.pilih {
			flex-direction: column;
			align-items: stretch;
		}
		.dua {
			grid-template-columns: 1fr;
		}
		/* Di layar sempit, dua kolom angka tidak terbaca (nama & nilai
		   terpotong). Tiap baris jadi kartu kecil: label di atas, lalu nilai
		   tiap pejabat dengan namanya — bukan tiga kolom yang dipaksa muat. */
		.kepala {
			display: none;
		}
		.baris {
			display: block;
			padding: 12px 14px;
		}
		.lbl {
			display: block;
			margin-bottom: 6px;
			font-size: 11.5px;
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}
		.val {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 12px;
			padding: 3px 0;
			font-size: 14.5px;
		}
		/* Nama pejabat sebagai label baris; di desktop disembunyikan karena
		   sudah ada di kepala tabel. */
		.who {
			flex: 1 1 auto;
			min-width: 0;
			font-size: 13px;
			font-weight: 500;
			color: var(--text-3);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.angka {
			flex: 0 0 auto;
			text-align: right;
		}
		.who {
			display: block;
		}
		.kutipan-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
