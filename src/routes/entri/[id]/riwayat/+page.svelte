<script lang="ts">
	import { fmtRelative } from '#lib/utils';
	import ConfirmButton from '#lib/components/ConfirmButton.svelte';
	import type { PotonganDiff } from '#lib/revisi';

	let { data } = $props();
	const entri = $derived(data.entri as Record<string, unknown>);
	type Baris = Record<string, unknown> & {
		diffIsi: PotonganDiff[] | null;
		diffKonteks: PotonganDiff[] | null;
		perubahanIsi: boolean;
		perubahanKonteks: boolean;
	};
	const revisi = $derived(data.revisi as Baris[]);

	const labelAksi: Record<string, string> = {
		buat: 'Dibuat',
		sunting: 'Disunting',
		tarik: 'Ditarik',
		pulihkan: 'Dipulihkan',
		setujui: 'Diverifikasi'
	};
</script>

<svelte:head>
	<title>Riwayat entri #{entri.id} - CekWakil</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container section">
	<nav class="crumbs tiny" aria-label="Breadcrumb">
		<a href={`/pejabat/${entri.slug}`}>{entri.nama}</a>
		<span aria-hidden="true">/</span>
		<span aria-current="page">Riwayat entri #{entri.id}</span>
	</nav>

	<header class="pagehead">
		<div>
			<p class="crumb tiny muted">Riwayat</p>
			<h1>Entri #{entri.id}</h1>
			<p class="sub muted">
				<strong class="num">{revisi.length}</strong> revisi · status <span class="status">{entri.status}</span>
				{#if entri.diverifikasi_at}
					· diverifikasi {fmtRelative(String(entri.diverifikasi_at))}
				{/if}
			</p>
		</div>
		<div class="headact">
			<a class="btn btn-sm" href={`/entri/${entri.id}/edit`}>Sunting</a>
			<a class="btn btn-secondary btn-sm" href={`/pejabat/${entri.slug}#p-${entri.id}`}>Lihat entri</a>
		</div>
	</header>

	{#if data.disimpan}
		<p class="notice notice-info tiny" role="status">
			Revisi baru tersimpan. Riwayat lama tetap utuh di bawah.
		</p>
	{/if}
	{#if data.dipulihkan}
		<p class="notice notice-info tiny" role="status">
			Isi entri dikembalikan ke revisi #{data.dipulihkan}. Tindakan ini sendiri tercatat sebagai revisi
			baru.
		</p>
	{/if}

	<ol class="log">
		{#each revisi as r, i (r.id)}
			<li class="rev" class:terkini={i === 0}>
				<div class="rev-side">
					<span class="rev-no num">#{r.revisi}</span>
					<span class="aksi" class:gagal={r.aksi === 'tarik'}>{labelAksi[String(r.aksi)] ?? r.aksi}</span>
				</div>

				<div class="rev-body">
					<p class="rev-meta tiny muted">
						{fmtRelative(String(r.created_at))}
						{#if r.oleh}· oleh <strong>{r.oleh}</strong>{:else}· oleh anonim{/if}
						{#if r.catatan}· “{r.catatan}”{/if}
					</p>

					{#if r.perubahanIsi && r.diffIsi}
						<blockquote class="diff">
							{#each r.diffIsi ?? [] as seg, j (j)}
								{#if seg.jenis === 'sama'}<span>{seg.t}</span>{:else if seg.jenis === 'tambah'}<ins
										>{seg.t}</ins
									>{:else}<del>{seg.t}</del>{/if}
							{/each}
						</blockquote>
					{:else if r.aksi === 'buat'}
						<blockquote class="diff"><span>{r.isi}</span></blockquote>
					{:else if r.diffIsi === null}
						<blockquote class="diff"><span>{r.isi}</span></blockquote>
					{:else}
						<p class="tiny muted same">Kutipan tidak berubah.</p>
					{/if}

					{#if r.perubahanKonteks && r.diffKonteks}
						<details class="konteks-diff">
							<summary class="tiny">Perubahan konteks</summary>
							<p>
								{#each r.diffKonteks ?? [] as seg, j (j)}
									{#if seg.jenis === 'sama'}<span>{seg.t}</span>{:else if seg.jenis === 'tambah'}<ins
											>{seg.t}</ins
										>{:else}<del>{seg.t}</del>{/if}
								{/each}
							</p>
						</details>
					{/if}

					{#if i !== 0}
						<form method="POST" action={`/entri/${entri.id}/edit?/pulihkan`} class="restoreform">
							<input type="hidden" name="revisi" value={r.revisi} />
							<ConfirmButton
								label="Kembalikan ke revisi ini"
								pesan="Yakin kembalikan?"
								class="btn btn-sm btn-secondary"
							/>
							<span class="tiny muted">tidak menghapus revisi setelahnya</span>
						</form>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>

<style>
	.crumbs {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 16px;
		color: var(--text-3);
	}
	.crumbs a {
		color: var(--text-2);
		text-decoration: none;
	}
	.pagehead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 18px;
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
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.headact {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.rev {
		display: grid;
		grid-template-columns: 150px minmax(0, 1fr);
		gap: 18px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
	}
	.rev.terkini {
		border-left: 4px solid var(--accent);
	}
	.rev-side {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-start;
	}
	.rev-no {
		font-size: 15px;
		font-weight: 680;
	}
	.aksi {
		font-size: 11px;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 1px 8px;
		border-radius: var(--radius-pill);
		color: var(--ok);
		background: var(--ok-soft);
		border: 1px solid var(--ok-line);
	}
	.aksi.gagal {
		color: var(--danger);
		background: var(--danger-soft);
		border-color: var(--danger-line);
	}
	.rev-body {
		min-width: 0;
	}
	.rev-meta {
		margin: 0 0 8px;
	}
	.diff {
		margin: 0 0 8px;
		padding-left: 12px;
		border-left: 2px solid var(--line);
		font-size: 15px;
		line-height: 1.6;
	}
	.diff ins {
		text-decoration: none;
		background: color-mix(in srgb, var(--ok) 18%, transparent);
		border-radius: 2px;
	}
	.diff del {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		border-radius: 2px;
	}
	.same {
		margin: 0 0 8px;
	}
	.konteks-diff summary {
		cursor: pointer;
		color: var(--text-2);
	}
	.konteks-diff p {
		margin: 6px 0 0;
		font-size: 13.5px;
		line-height: 1.6;
		color: var(--text-2);
	}
	.konteks-diff ins {
		text-decoration: none;
		background: color-mix(in srgb, var(--ok) 18%, transparent);
	}
	.konteks-diff del {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
	}
	.restoreform {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	@media (max-width: 720px) {
		.rev {
			grid-template-columns: 1fr;
			gap: 8px;
		}
		.rev-side {
			flex-direction: row;
			align-items: center;
			gap: 8px;
		}
	}
</style>
