<script lang="ts">
	// Skeleton per-layout. Setiap varian meniru struktur halaman aslinya
	// (masthead, rail, filter, kartu kutipan) supaya tidak ada "lompatan
	// layout" saat konten asli masuk.
	//
	// Semua blok memakai kelas `.skeleton` dari app.css; di sini hanya
	// dimensi/posisinya yang ditentukan agar cocok dengan layout nyata.
	let {
		variant = 'daftar'
	}: {
		variant?:
			| 'beranda'
			| 'arsip'
			| 'direktori'
			| 'profil'
			| 'harta'
			| 'panduan'
			| 'dokumen'
			| 'form'
			| 'daftar';
	} = $props();

	// Lebar baris teks bervariasi seperti kalimat asli, bukan semua sama.
	const barisKutipan = [92, 100, 64];
</script>

{#snippet kartuKutipan(n = 3)}
	<ul class="list">
		{#each Array(n) as _, i (i)}
			<li class="exhibit">
				<div class="ex-top">
					<span class="skeleton q-no"></span>
					<span class="skeleton q-name"></span>
					<span class="skeleton q-chip"></span>
				</div>
				<div class="q-body">
					{#each barisKutipan as w, j (j)}
						<span class="skeleton q-line" style={`width:${w}%`}></span>
					{/each}
				</div>
				<div class="q-src">
					<span class="skeleton tiny-chip"></span>
					<span class="skeleton tiny-chip sm"></span>
				</div>
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet railSekilas()}
	<aside class="rail">
		<div class="rail-card">
			<span class="skeleton rail-h"></span>
			{#each Array(3) as _, i (i)}
				<div class="rail-stat">
					<span class="skeleton rail-label-s"></span>
					<span class="skeleton rail-val"></span>
				</div>
			{/each}
		</div>
		<div class="rail-card">
			<span class="skeleton rail-h sm"></span>
			{#each Array(4) as _, i (i)}
				<div class="rail-link">
					<span class="skeleton rail-no"></span>
					<span class="skeleton rail-text"></span>
				</div>
			{/each}
		</div>
	</aside>
{/snippet}

<div class="skel" aria-hidden="true">
	{#if variant === 'beranda'}
		<section class="hero">
			<span class="skeleton eyebrow"></span>
			<span class="skeleton h1"></span>
			<span class="skeleton h1 short"></span>
			<span class="skeleton lede"></span>
			<span class="skeleton lede w80"></span>
			<span class="skeleton searchbar"></span>
			<div class="btnrow">
				<span class="skeleton btn"></span>
				<span class="skeleton btn"></span>
			</div>
		</section>
		<section class="statsbar">
			{#each Array(3) as _, i (i)}
				<div class="stat">
					<span class="skeleton stat-num"></span>
					<span class="skeleton stat-lbl"></span>
				</div>
			{/each}
		</section>
		<section class="twocol">
			<div class="main">
				<div class="sec-head">
					<span class="skeleton sec-title"></span>
					<span class="skeleton sec-rule"></span>
				</div>
				{@render kartuKutipan(3)}
			</div>
			{@render railSekilas()}
		</section>
	{:else if variant === 'arsip' || variant === 'direktori' || variant === 'daftar'}
		<header class="pagehead">
			<span class="skeleton eyebrow"></span>
			<span class="skeleton h1"></span>
			<span class="skeleton sub"></span>
			{#if variant === 'direktori'}
				<span class="skeleton btn right"></span>
			{/if}
		</header>
		<span class="skeleton searchbar full"></span>
		<div class="chips">
			{#each [64, 96, 122, 88, 110, 76] as w, i (i)}
				<span class="skeleton chip" style={`width:${w}px`}></span>
			{/each}
		</div>
		<div class="selects">
			<span class="skeleton select"></span>
			<span class="skeleton select"></span>
		</div>
		{#if variant === 'direktori'}
			<ul class="grid">
				{#each Array(8) as _, i (i)}
					<li class="person">
						<div class="p-top">
							<span class="skeleton p-name"></span>
							<span class="skeleton p-badge"></span>
						</div>
						<span class="skeleton p-meta"></span>
						<div class="p-tags">
							<span class="skeleton p-tag"></span>
							<span class="skeleton p-tag sm"></span>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			{@render kartuKutipan(4)}
		{/if}
	{:else if variant === 'profil'}
		<nav class="crumbs">
			<span class="skeleton crumb"></span>
			<span class="skeleton crumb sm"></span>
		</nav>
		<header class="masthead">
			<span class="skeleton eyebrow"></span>
			<div class="mast-top">
				<div class="mast-id">
					<span class="skeleton avatar"></span>
					<div class="mast-text">
						<span class="skeleton h1 big"></span>
						<span class="skeleton meta"></span>
					</div>
				</div>
				<div class="mast-actions">
					<span class="skeleton btn"></span>
					<span class="skeleton btn"></span>
				</div>
			</div>
			<ul class="facts">
				{#each Array(4) as _, i (i)}
					<li>
						<span class="skeleton f-label"></span>
						<span class="skeleton f-value"></span>
					</li>
				{/each}
			</ul>
			<span class="skeleton bio"></span>
			<span class="skeleton bio w70"></span>
		</header>
		<div class="twocol">
			<div class="main">
				{#each Array(2) as _, s (s)}
					<div class="block">
						<div class="sec-head">
							<span class="skeleton sec-title"></span>
							<span class="skeleton sec-rule"></span>
						</div>
						<span class="skeleton block-card"></span>
					</div>
				{/each}
				{#if true}
					<div class="sec-head">
						<span class="skeleton sec-title"></span>
						<span class="skeleton sec-rule"></span>
					</div>
					{@render kartuKutipan(2)}
				{/if}
			</div>
			{@render railSekilas()}
		</div>
	{:else if variant === 'harta'}
		<header class="pagehead">
			<span class="skeleton eyebrow"></span>
			<span class="skeleton h1"></span>
			<span class="skeleton sub"></span>
		</header>
		<div class="lay2">
			<div class="panel">
				<span class="skeleton sec-title"></span>
				<span class="skeleton sub sm"></span>
				<span class="skeleton field"></span>
				<div class="fieldrow">
					<span class="skeleton field"></span>
					<span class="skeleton field wide"></span>
				</div>
				<span class="skeleton field"></span>
				<span class="skeleton btn full"></span>
			</div>
			<div class="main">
				<div class="sec-head">
					<span class="skeleton sec-title"></span>
				</div>
				<ul class="rows">
					{#each Array(6) as _, i (i)}
						<li class="srow">
							<span class="skeleton srow-name"></span>
							<span class="skeleton srow-val"></span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{:else if variant === 'dokumen'}
		<!-- Halaman berisi teks panjang berurutan (/kontribusi): judul, lalu
		     beberapa blok bernomor, tanpa rail. -->
		<header class="pagehead">
			<span class="skeleton eyebrow"></span>
			<span class="skeleton h1 big"></span>
			<span class="skeleton lede"></span>
			<span class="skeleton lede w80"></span>
		</header>
		{#each Array(3) as _, i (i)}
			<div class="sec-head">
				<span class="skeleton sec-title"></span>
			</div>
			<div class="narrowcol">
				{#each Array(i === 0 ? 4 : 2) as _, j (j)}
					<div class="fgroup">
						<span class="skeleton sub sm"></span>
						<span class="skeleton lede"></span>
						<span class="skeleton lede w80"></span>
					</div>
				{/each}
			</div>
		{/each}
	{:else if variant === 'form' || variant === 'panduan'}
		<header class="pagehead">
			<span class="skeleton eyebrow"></span>
			<span class="skeleton h1"></span>
			<span class="skeleton sub"></span>
		</header>
		<div class="narrowcol">
			{#each Array(5) as _, i (i)}
				<div class="fgroup">
					<span class="skeleton f-label"></span>
					<span class="skeleton field"></span>
				</div>
			{/each}
			<span class="skeleton btn full"></span>
		</div>
	{/if}
</div>

<style>
	/* Skeleton harus dirasakan sebagai "halaman yang sedang dimuat", jadi
	   wrapper-nya meniru padding & lebar container asli. */
	.skel {
		width: 100%;
		max-width: var(--container);
		margin: 0 auto;
		padding: 40px 24px;
		min-height: 68vh;
	}
	.skel :global(.skeleton) {
		display: block;
	}
	/* Wrapper ini aria-hidden dan tidak interaktif; jangan tampilkan ring fokus
	   yang bisa muncul sisa dari elemen sebelumnya. */
	.skel :global(*) {
		outline: none !important;
	}

	/* --- primitif --- */
	.eyebrow {
		width: 150px;
		height: 11px;
		margin-bottom: 14px;
	}
	.h1 {
		/* mengikuti clamp h1 asli */
		width: min(560px, 80%);
		height: clamp(30px, 3.4vw, 40px);
		margin-bottom: 10px;
		border-radius: 6px;
	}
	.h1.short {
		width: min(360px, 55%);
		margin-bottom: 20px;
	}
	.h1.big {
		width: min(640px, 100%);
		height: clamp(38px, 4.6vw, 56px);
		margin-bottom: 14px;
	}
	.lede {
		width: 100%;
		max-width: 620px;
		height: 14px;
		margin-bottom: 8px;
	}
	.lede.w80 {
		width: 70%;
	}
	.searchbar {
		width: 100%;
		max-width: 580px;
		height: 48px;
		margin-top: 24px;
		border-radius: 8px;
	}
	.searchbar.full {
		max-width: none;
		height: 44px;
		margin: 0 0 14px;
	}
	.btnrow {
		display: flex;
		gap: 10px;
		margin-top: 14px;
	}
	.btn {
		width: 132px;
		height: 40px;
		border-radius: var(--radius);
	}
	.btn.full {
		width: 100%;
		margin-top: 16px;
	}
	.btn.right {
		margin-left: auto;
	}
	.sub {
		width: 240px;
		height: 13px;
		margin-bottom: 6px;
	}
	.crumbs {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.crumb {
		width: 90px;
		height: 11px;
	}
	.crumb.sm {
		width: 140px;
	}
	.chip {
		height: 24px;
		border-radius: var(--radius-pill);
	}
	.select {
		width: 150px;
		height: 34px;
		border-radius: var(--radius);
	}
	.field {
		width: 100%;
		height: 40px;
		border-radius: var(--radius);
	}
	.field.wide {
		width: 100%;
	}
	.f-label {
		width: 90px;
		height: 11px;
		margin-bottom: 8px;
	}

	/* --- struktur halaman --- */
	.hero {
		padding: 18px 0 34px;
		border-bottom: 1px solid var(--line);
	}
	.statsbar {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-bottom: 1px solid var(--line);
		padding: 18px 0;
		gap: 24px;
	}
	.stat-num {
		width: 44px;
		height: 26px;
		margin-bottom: 8px;
	}
	.stat-lbl {
		width: 110px;
		height: 12px;
	}
	.pagehead {
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}
	.selects {
		display: flex;
		gap: 12px;
		margin-bottom: 22px;
	}
	.sec-head {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
	}
	.sec-title {
		width: 120px;
		height: 22px;
		border-radius: var(--radius);
		flex: 0 0 auto;
	}
	.sec-rule {
		flex: 1 1 auto;
		height: 1px;
	}

	/* --- kartu kutipan (meniru .exhibit asli) --- */
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.exhibit {
		border: 1px solid var(--line);
		border-left: 5px solid var(--n-200);
		border-radius: var(--radius-lg);
		background: var(--surface);
		overflow: hidden;
	}
	.ex-top {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 20px 0;
	}
	.q-no {
		width: 30px;
		height: 11px;
	}
	.q-name {
		width: 170px;
		height: 14px;
	}
	.q-chip {
		width: 88px;
		height: 20px;
		margin-left: auto;
		border-radius: var(--radius-pill);
	}
	.q-body {
		padding: 12px 20px 14px;
	}
	.q-line {
		height: 14px;
		margin-bottom: 8px;
	}
	.q-src {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 10px 20px;
		border-top: 1px solid var(--line);
		background: var(--n-50);
	}
	.tiny-chip {
		width: 92px;
		height: 18px;
		border-radius: var(--radius-pill);
	}
	.tiny-chip.sm {
		width: 54px;
	}

	/* --- dua kolom + rail --- */
	.twocol {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		gap: 40px;
		align-items: start;
		margin-top: 28px;
	}
	.main {
		min-width: 0;
	}
	.rail {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.rail-card {
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	.rail-h {
		width: 80px;
		height: 12px;
		margin-bottom: 14px;
	}
	.rail-h.sm {
		width: 64px;
	}
	.rail-stat {
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	.rail-stat:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.rail-label-s {
		width: 100px;
		height: 10px;
		margin-bottom: 7px;
	}
	.rail-val {
		width: 64px;
		height: 18px;
	}
	.rail-link {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 9px 0;
		border-bottom: 1px solid var(--line);
	}
	.rail-link:last-child {
		border-bottom: none;
	}
	.rail-no {
		width: 16px;
		height: 10px;
	}
	.rail-text {
		width: 110px;
		height: 12px;
	}

	/* --- profil --- */
	.crumbs {
		display: flex;
		gap: 6px;
		margin-bottom: 18px;
	}
	.masthead {
		padding-bottom: 24px;
		border-bottom: 1px solid var(--line);
	}
	.mast-top {
		display: flex;
		justify-content: space-between;
		gap: 32px;
	}
	.mast-id {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		min-width: 0;
		flex: 1 1 auto;
	}
	.mast-text {
		min-width: 0;
		flex: 1 1 auto;
	}
	.avatar {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		flex: 0 0 auto;
		margin-top: 8px;
	}
	.meta {
		width: min(320px, 60%);
		height: 14px;
	}
	.mast-actions {
		display: flex;
		gap: 8px;
		flex: 0 0 auto;
	}
	.facts {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}
	.facts li {
		padding: 12px 20px;
		border-left: 1px solid var(--line);
		min-height: 72px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.facts li:first-child {
		border-left: none;
		padding-left: 0;
	}
	.f-value {
		width: 80%;
		height: 15px;
	}
	.bio {
		width: 100%;
		max-width: 640px;
		height: 13px;
		margin-top: 16px;
	}
	.bio.w70 {
		width: 62%;
	}
	.block {
		margin-bottom: 30px;
	}
	.block-card {
		width: 100%;
		/* Tinggi berbeda per blok supaya tidak terlihat seperti 2 kartu identik;
		   mendekati tinggi kartu LHKPN & kasus aslinya. */
		height: 108px;
		border-radius: var(--radius-lg);
	}

	/* --- direktori (grid kartu pejabat) --- */
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 10px;
	}
	.person {
		padding: 13px 15px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.p-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}
	.p-name {
		width: 70%;
		height: 15px;
	}
	.p-badge {
		width: 22px;
		height: 20px;
		border-radius: var(--radius-pill);
		flex: 0 0 auto;
	}
	.p-meta {
		width: 85%;
		height: 11px;
	}
	.p-tags {
		display: flex;
		gap: 4px;
	}
	.p-tag {
		width: 58px;
		height: 18px;
		border-radius: 3px;
	}
	.p-tag.sm {
		width: 72px;
	}

	/* --- harta --- */
	.lay2 {
		display: grid;
		grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
		gap: 28px;
		align-items: start;
	}
	.panel {
		padding: 18px;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface);
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.panel .sec-title {
		width: 60%;
		height: 18px;
	}
	.sub.sm {
		width: 80%;
		height: 11px;
		margin: 0;
	}
	.fieldrow {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: 12px;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	.srow {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: var(--surface);
	}
	.srow + .srow {
		border-top: 1px solid var(--line);
	}
	.srow-name {
		width: 40%;
		height: 13px;
	}
	.srow-val {
		width: 90px;
		height: 13px;
	}

	/* --- form --- */
	.narrowcol {
		max-width: 720px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.fgroup {
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 900px) {
		.twocol,
		.lay2 {
			grid-template-columns: 1fr;
			gap: 22px;
		}
		.rail {
			order: -1;
		}
		.rail-card:last-child {
			display: none;
		}
		.mast-top {
			flex-direction: column;
			gap: 14px;
		}
		.facts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.facts li:nth-child(odd) {
			padding-left: 0;
			border-left: none;
		}
	}
	@media (max-width: 720px) {
		.skel {
			padding: 28px 20px;
		}
		.statsbar {
			grid-template-columns: 1fr;
			gap: 12px;
		}
		.avatar {
			width: 42px;
			height: 42px;
		}
		.mast-actions {
			width: 100%;
		}
		.ex-top,
		.q-body,
		.q-src {
			padding-left: 15px;
			padding-right: 15px;
		}
		.selects .select {
			flex: 1 1 auto;
		}
	}
</style>
