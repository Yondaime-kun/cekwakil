<script lang="ts">
	import { REPO_URL } from '#lib/site';

	const year = new Date().getFullYear();

	// Prinsip footer: setiap link hanya muncul SEKALI. Navigasi utama sudah
	// memuat Pejabat/Arsip/Harta/Panduan/Lapor, jadi footer tidak mengulang
	// halaman yang sama — hanya menambah hal yang tidak ada di nav.
	type Link = { href: string; label: string; luar?: boolean };
	const kolom: Array<{ judul: string; links: Link[] }> = [
		{
			judul: 'Kontribusi',
			links: [
				{ href: '/lengkapi', label: 'Lengkapi data' },
				{ href: '/submit', label: 'Lapor pernyataan' },
				{ href: '/pejabat/tambah', label: 'Tambah profil pejabat' },
				{ href: '/rekam', label: 'Tambah rekam jejak' },
				{ href: '/laporkan', label: 'Laporkan entri keliru' }
			]
		},
		{
			judul: 'Data',
			links: [
				{ href: '/api/export?format=json', label: 'Unduh JSON' },
				{ href: '/api/export?format=csv', label: 'Unduh CSV' },
				{ href: '/sitemap.xml', label: 'Sitemap' }
			]
		},
		{
			judul: 'Lainnya',
			links: [{ href: '/admin', label: 'Moderasi' }]
		}
	];
</script>

<footer class="site-footer">
	<div class="container frow">
		<div class="brandcol">
			<p class="brandline">
				<img src="/favicon.svg" alt="" width="20" height="20" aria-hidden="true" />CekWakil
			</p>
			<p class="small muted">
				Arsip publik pernyataan anggota DPR dan pejabat negara. Setiap entri wajib punya kutipan
				verbatim dan tautan sumber; yang tidak sesuai sumber bisa dilaporkan dan ditarik.
			</p>
			<p class="tiny muted lic">Kode MIT · Data CC BY-SA 4.0 · Silakan dimirror dengan atribusi.</p>

			<div class="sosial">
				<a
					class="ghlink"
					href={REPO_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Kode sumber CekWakil di GitHub"
					title="Kode sumber di GitHub"
				>
					<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
						<path
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
						/>
					</svg>
				</a>
				<a class="gh-kecil" href={`${REPO_URL}/issues/new`} target="_blank" rel="noopener noreferrer"
					>Laporkan bug</a
				>
				<a class="gh-kecil" href={`${REPO_URL}/stargazers`} target="_blank" rel="noopener noreferrer"
					>Sorotan</a
				>
			</div>
		</div>

		{#each kolom as k (k.judul)}
			<div class="col">
				<p class="h">{k.judul}</p>
				<ul>
					{#each k.links as l (l.href)}
						<li>
							<a
								href={l.href}
								target={l.luar ? '_blank' : undefined}
								rel={l.luar ? 'noopener noreferrer' : undefined}>{l.label}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<div class="container copy tiny muted">
		<span>&copy; {year} CekWakil</span>
		<span class="tagline">Kode terbuka, data terbuka.</span>
	</div>
</footer>

<style>
	footer {
		margin-top: 64px;
		padding-top: 36px;
		padding-bottom: 24px;
		border-top: 1px solid var(--line);
		background: var(--surface);
	}
	.frow {
		display: grid;
		grid-template-columns: minmax(0, 2.4fr) repeat(3, minmax(0, 1fr));
		gap: 32px;
		margin-bottom: 28px;
	}
	.brandline {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 680;
		letter-spacing: -0.02em;
		margin-bottom: 8px;
		color: var(--text);
	}
	.brandline img {
		border-radius: 5px;
	}
	.brandcol p {
		max-width: 46ch;
	}
	.lic {
		margin-top: 12px;
	}
	.sosial {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
	}
	.ghlink {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		color: var(--text-2);
		background: var(--n-50);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		transition:
			color 120ms var(--ease),
			border-color 120ms var(--ease);
	}
	.ghlink:hover {
		color: var(--text);
		border-color: var(--line-strong);
	}
	.gh-kecil {
		font-size: 12px;
		color: var(--text-3);
		text-decoration: none;
	}
	.gh-kecil:hover {
		color: var(--accent);
		text-decoration: underline;
	}
	.h {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-3);
		margin-bottom: 8px;
	}
	.col ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13.5px;
	}
	.col a {
		color: var(--text-2);
		text-decoration: none;
	}
	.col a:hover {
		color: var(--accent);
		text-decoration: underline;
	}
	.copy {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding-top: 16px;
		border-top: 1px solid var(--line);
	}
	@media (max-width: 860px) {
		.frow {
			grid-template-columns: 1fr 1fr;
			gap: 24px;
		}
		.brandcol {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 480px) {
		.frow {
			grid-template-columns: 1fr;
		}
		.copy {
			justify-content: flex-start;
		}
	}
</style>
