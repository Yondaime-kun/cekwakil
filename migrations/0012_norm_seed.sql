-- Normalisasi nama: buang gelar umum & tanda baca, lowercase.
-- Dipakai untuk deteksi duplikat saat membuat profil baru.
INSERT OR REPLACE INTO pejabat_nama_norm (pejabat_id, nama_norm)
SELECT
	id,
	TRIM(
		REPLACE(
			REPLACE(
				REPLACE(
					REPLACE(
						REPLACE(
							REPLACE(
								REPLACE(
									REPLACE(
										REPLACE(
											REPLACE(lower(nama), 'h. ', ' '),
											'hajj ',
											' '
										),
										'dr. ',
										' '
									),
									'ir. ',
									' '
								),
								'prof. ',
								' '
							),
							'drs. ',
							' '
						),
						'hj. ',
						' '
					),
					',',
					''
				),
				'.',
				''
			),
			'''',
			''
		)
	)
FROM pejabat;
