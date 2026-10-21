/** Toast global kecil: pesan singkat yang hilang sendiri (share, salin, dsb). */
import { writable } from 'svelte/store';

export type Toast = { id: number; pesan: string; jenis: 'ok' | 'error' };

export const toasts = writable<Toast[]>([]);

let urut = 0;

export function toast(pesan: string, jenis: 'ok' | 'error' = 'ok'): void {
	const id = ++urut;
	toasts.update((t) => [...t, { id, pesan, jenis }]);
	setTimeout(() => {
		toasts.update((t) => t.filter((x) => x.id !== id));
	}, 3200);
}
