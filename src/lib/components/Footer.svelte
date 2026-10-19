<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer>
	<div class="container frow">
		<div>
			<p class="brandline">CekWakil</p>
			<p class="small muted">
				Arsip publik pernyataan anggota DPR dan pejabat negara. Setiap entri wajib menyertakan
				kutipan asli dan tautan sumber berita. Siapa pun bisa menambah, dan siapa pun bisa
				menandai yang keliru.
			</p>
		</div>
		<div class="small muted fcol">
			<p><strong>Sumber data</strong><br />Profil DPR RI 2024-2029 dan Kabinet Merah Putih.</p>
			<p>Ada data yang perlu diperbaiki? <a href="/submit">Kirim lewat form lapor</a>.</p>
			<p><a href="/harta">Harta pejabat (LHKPN)</a> · <a href="/panduan">Panduan sistem DPR</a></p>
			<p>
				<strong>Data terbuka</strong><br />
				Unduh semua: <a href="/api/export?format=json">JSON</a> ·
				<a href="/api/export?format=csv">CSV</a>. Silakan dimirror.
			</p>
		</div>
	</div>
	<div class="container copy tiny muted">
		<span>&copy; {year} CekWakil</span>
		<span>Kode terbuka, data terbuka.</span>
	</div>
</footer>

<style>
	footer {
		margin-top: 64px;
		padding-top: 32px;
		padding-bottom: 24px;
		border-top: 1px solid var(--line);
		background: var(--n-0);
	}
	.brandline {
		font-size: 15px;
		font-weight: 680;
		letter-spacing: -0.02em;
		margin-bottom: 8px;
		color: var(--text);
	}
	.frow {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: 32px;
		margin-bottom: 24px;
	}
	.fcol p + p {
		margin-top: 10px;
	}
	.frow p {
		max-width: 56ch;
	}
	.copy {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding-top: 16px;
		border-top: 1px solid var(--line);
	}
	@media (max-width: 640px) {
		.frow {
			grid-template-columns: 1fr;
			gap: 20px;
		}
	}
</style>
