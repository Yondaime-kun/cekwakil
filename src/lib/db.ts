// Access to Cloudflare bindings. adapter-cloudflare 8 exposes bindings via the
// `cloudflare:workers` module, available in real Workers and in local dev.

import { env } from 'cloudflare:workers';

export function getDB(): D1Database {
	const db = (env as { DB?: D1Database }).DB;
	if (!db)
		throw new Error(
			'D1 binding DB not configured. Run `wrangler d1 create cekwakil` and set database_id in wrangler.jsonc'
		);
	return db;
}

export function getEnv(): Record<string, unknown> {
	return env as unknown as Record<string, unknown>;
}
