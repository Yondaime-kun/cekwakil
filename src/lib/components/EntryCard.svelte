<script lang="ts">
	import { fmtDate, splitHighlight, hostname } from '#lib/utils';
	import { renderMarkdown } from '#lib/markdown';

	// Kartu kutipan gaya "eksibisi" — satu-satunya markup kutipan di situs.
	// Nomor eksibisi (Q-01) harus unik & stabil, jadi berasal dari nomor urut
	// global yang dikirim pemanggil (mis. offset halaman + index).
	type Sumber = { url: string; arsip_url: string | null };

	let {
		e,
		sumber = [],
		tampilkanNama = false,
		q = '',
		ringkas = false,
		nomor = 0
	}: {
		e: Record<string, unknown>;
		sumber?: Sumber[];
		tampilkanNama?: boolean;
		q?: string;
		ringkas?: boolean;
		nomor?: number;
	} = $props();

	const daftarSumber = $derived(
		sumber.length > 0
			? sumber
			: [{ url: String(e.sumber_url ?? ''), arsip_url: (e.arsip_url as string) ?? null }]
	);
	const potongan = $derived(splitHighlight(String(e.isi ?? ''), q));
	// Konteks boleh markdown; kutipan di atas TIDAK (verbatim, plain text).
	const konteksHtml = $derived(renderMarkdown(String(e.konteks ?? '')));
	const kode = $derived(nomor > 0 ? `Q-${String(nomor).padStart(2, '0')}` : '');
</script>

<article class="exhibit" id={`p-${e.id}`}>
	<div class="ex-top">
		{#if kode}<span class="ex-no num">{kode}</span>{/if}
		{#if tampilkanNama}
			<a class="ex-name" href={`/pejabat/${e.slug}`}>{e.nama}</a>
			<span class="ex-role tiny muted">{e.jabatan}{e.partai ? ` · ${e.partai}` : ''}</span>
		{/if}
		<span class="chip chip-kategori">{e.kategori}</span>
	</div>

	<blockquote>
		{#each potongan as seg, i (i)}{#if seg.hit}<mark>{seg.t}</mark>{:else}{seg.t}{/if}{/each}
	</blockquote>

	{#if e.konteks && !ringkas}
		<div class="small muted konteks md">{@html konteksHtml}</div>
	{/if}

	<footer class="ex-src">
		<span class="src-label">Sumber</span>
		{#each daftarSumber as s, i (i)}
			<a class="src-chip" href={s.url} target="_blank" rel="noopener noreferrer" title={s.url}>
				{#if daftarSumber.length > 1}<span class="srcnum num">{i + 1}</span>{/if}{hostname(s.url)}
			</a>
			{#if s.arsip_url}
				<a
					class="arsip-chip"
					href={s.arsip_url}
					target="_blank"
					rel="noopener noreferrer"
					title="Snapshot arsip Wayback">↗ arsip</a
				>
			{/if}
		{/each}
		<time class="tiny muted num" datetime={String(e.tanggal ?? '')}>{fmtDate(String(e.tanggal))}</time>

		<div class="aksi">
			<a class="act" href={`/entri/${e.id}/riwayat`} title="Lihat riwayat penyuntingan entri ini">
				<svg aria-hidden="true" viewBox="0 0 16 16" width="13" height="13">
					<path d="M8 3.5v4l2.6 1.6M2.8 8a5.2 5.2 0 1 0 1.6-3.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Riwayat{#if Number(e.jumlah_revisi) > 1}<span class="revn num">{e.jumlah_revisi}</span>{/if}
			</a>
			<a class="act" href={`/entri/${e.id}/edit`} title="Sunting entri ini">
				<svg aria-hidden="true" viewBox="0 0 16 16" width="13" height="13">
					<path d="m10.5 3 2.5 2.5L6 12.5 3 13l.5-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
				</svg>
				Sunting
			</a>
			<a class="act act-lapor" href={`/laporkan?entri=${e.id}`} title="Laporkan entri ini kalau tidak sesuai sumber">
				<svg aria-hidden="true" viewBox="0 0 16 16" width="13" height="13">
					<path d="M3.5 13.5V2.8c2.5-1 4.5 1 7 0v5.4c-2.5 1-4.5-1-7 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Laporkan
			</a>
		</div>
	</footer>
</article>

<style>
	.exhibit {
		background: var(--surface);
		border: 1px solid var(--line);
		border-left: 5px solid var(--accent);
		border-radius: var(--radius-lg);
		scroll-margin-top: calc(var(--header-h) + 16px);
		transition: border-color 140ms var(--ease);
	}
	.exhibit:hover {
		border-color: var(--line-strong);
		border-left-color: var(--accent);
	}
	.exhibit:target {
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.ex-top {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 14px 20px 0;
		flex-wrap: wrap;
	}
	.ex-no {
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--text-3);
	}
	.ex-name {
		font-size: 15.5px;
		font-weight: 620;
		color: var(--text);
		text-decoration: none;
	}
	.ex-name:hover {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.ex-role {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Chip kategori didorong ke kanan saat ada nama; kalau tidak, menempel ke nomor. */
	.ex-top :global(.chip) {
		margin-left: auto;
	}
	blockquote {
		margin: 8px 0 14px;
		padding: 0 20px;
		font-size: 16.5px;
		line-height: 1.6;
	}
	.konteks {
		margin: -6px 0 14px;
		padding: 0 20px;
		max-width: 76ch;
	}
	.md :global(p) {
		margin: 0 0 6px;
	}
	.md :global(p:last-child) {
		margin-bottom: 0;
	}
	.md :global(ul),
	.md :global(ol) {
		margin: 0 0 6px;
		padding-left: 18px;
	}
	.md :global(code) {
		font-family: ui-monospace, monospace;
		font-size: 0.9em;
		padding: 1px 4px;
		background: var(--n-100);
		border-radius: 3px;
	}
	.ex-src {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		padding: 9px 20px;
		border-top: 1px solid var(--accent-line);
		background: var(--accent-soft);
		border-radius: 0 0 calc(var(--radius-lg) - 1px) 0;
	}
	.src-label {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-2);
	}
	.src-chip,
	.arsip-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 1px 9px;
		font-size: 12.5px;
		font-weight: 550;
		color: var(--accent);
		background: var(--surface);
		border: 1px solid var(--accent-line);
		border-radius: var(--radius-pill);
		text-decoration: none;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.srcnum {
		font-size: 10.5px;
		color: var(--text-3);
	}
	.arsip-chip {
		font-size: 11.5px;
		color: var(--text-2);
	}
	.src-chip:hover,
	.arsip-chip:hover {
		text-decoration: none;
		border-color: var(--accent);
	}
	/* Grup aksi dipisah dari sumber supaya tidak terlihat sebagai teks melayang. */
	.aksi {
		display: flex;
		align-items: center;
		margin-left: auto;
		background: var(--surface);
		border: 1px solid var(--accent-line);
		border-radius: var(--radius-pill);
		overflow: hidden;
	}
	.act {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 11px;
		font-size: 12.5px;
		font-weight: 550;
		color: var(--text-2);
		text-decoration: none;
		white-space: nowrap;
		border-left: 1px solid var(--accent-line);
		transition:
			background-color 120ms var(--ease),
			color 120ms var(--ease);
	}
	.act:first-child {
		border-left: none;
	}
	.act:hover {
		background: var(--n-50);
		color: var(--accent);
		text-decoration: none;
	}
	.act:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}
	.act-lapor:hover {
		color: var(--danger);
		background: var(--danger-soft);
	}
	.revn {
		display: inline-block;
		min-width: 15px;
		padding: 0 4px;
		font-size: 10px;
		line-height: 15px;
		text-align: center;
		font-weight: 700;
		color: var(--accent);
		background: var(--accent-soft);
		border-radius: var(--radius-pill);
	}
	@media (max-width: 720px) {
		.ex-top {
			padding: 12px 15px 0;
		}
		blockquote {
			padding: 0 15px;
			font-size: 15.5px;
		}
		.konteks {
			padding: 0 15px;
		}
		.ex-src {
			padding: 8px 15px;
			gap: 6px;
		}
		.aksi {
			width: 100%;
			margin-left: 0;
		}
		.act {
			flex: 1 1 0;
			justify-content: center;
			padding: 7px 4px;
			font-size: 12px;
		}
		.src-chip {
			max-width: 130px;
		}
		.ex-role {
			white-space: normal;
			width: 100%;
		}
	}
</style>
