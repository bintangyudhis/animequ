// Favorit disimpan lokal di browser pengunjung (localStorage), tanpa
// akun dan tanpa dikirim ke server mana pun. Kunci berversi supaya format
// lama tidak tercampur bila skemanya berubah di hari lain.

export type AnimeFavorit = {
  id: number;
  judul: string;
  poster: string | null;
};

const KUNCI = "animequ-favorit-v1";

export function bacaFavorit(): AnimeFavorit[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI);
    if (!mentah) return [];
    const parsed = JSON.parse(mentah) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AnimeFavorit =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { id?: unknown }).id === "number" &&
        typeof (item as { judul?: unknown }).judul === "string",
    );
  } catch {
    return [];
  }
}

export function isFavorit(id: number): boolean {
  return bacaFavorit().some((item) => item.id === id);
}

// Mengembalikan true bila setelah aksi ini judul menjadi favorit.
export function toggleFavorit(item: AnimeFavorit): boolean {
  const daftar = bacaFavorit();
  const sudah = daftar.some((favorit) => favorit.id === item.id);
  simpanFavorit(
    sudah
      ? daftar.filter((favorit) => favorit.id !== item.id)
      : [...daftar, item],
  );
  return !sudah;
}

export function simpanFavorit(daftar: AnimeFavorit[]): void {
  try {
    window.localStorage.setItem(KUNCI, JSON.stringify(daftar));
    window.dispatchEvent(new Event("animequ:favorit"));
  } catch {
    // Penyimpanan penuh/diblokir: favorit sekadar tidak tersimpan.
  }
}
