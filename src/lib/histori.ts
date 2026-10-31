// Histori tontonan: riwayat halaman detail yang dibuka, disimpan lokal
// di browser pengunjung (localStorage) seperti favorit — tanpa akun dan
// tanpa dikirim ke server mana pun. Entri terbaru selalu di depan dan
// daftar dibatasi 50 entri supaya penyimpanan tidak membengkak.

export type AnimeHistori = {
  id: number;
  judul: string;
  poster: string | null;
  dikunjungi: string;
};

const KUNCI = "animequ-histori-v1";
const MAKSIMAL = 50;

export function bacaHistori(): AnimeHistori[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI);
    if (!mentah) return [];
    const parsed = JSON.parse(mentah) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AnimeHistori =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { id?: unknown }).id === "number" &&
        typeof (item as { judul?: unknown }).judul === "string" &&
        typeof (item as { dikunjungi?: unknown }).dikunjungi === "string",
    );
  } catch {
    return [];
  }
}

export function catatKunjungan(item: Omit<AnimeHistori, "dikunjungi">): void {
  try {
    const tanpaItemLama = bacaHistori().filter(
      (histori) => histori.id !== item.id,
    );
    const daftar = [
      { ...item, dikunjungi: new Date().toISOString() },
      ...tanpaItemLama,
    ].slice(0, MAKSIMAL);
    window.localStorage.setItem(KUNCI, JSON.stringify(daftar));
    window.dispatchEvent(new Event("animequ:histori"));
  } catch {
    // Penyimpanan penuh/diblokir: kunjungan sekadar tidak tercatat.
  }
}

export function simpanHistori(daftar: AnimeHistori[]): void {
  try {
    window.localStorage.setItem(KUNCI, JSON.stringify(daftar));
    window.dispatchEvent(new Event("animequ:histori"));
  } catch {
    // Penyimpanan penuh/diblokir: perubahan sekadar tidak tersimpan.
  }
}
