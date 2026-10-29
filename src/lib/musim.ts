import type { AnimeRingkas } from "./anilist";

export type Musim = "WINTER" | "SPRING" | "SUMMER" | "FALL";

const NAMA_MUSIM: Record<Musim, string> = {
  WINTER: "Musim Dingin",
  SPRING: "Musim Semi",
  SUMMER: "Musim Panas",
  FALL: "Musim Gugur",
};

// Musim AniList mengikuti kuartal kalender: Jan–Mar dingin, Apr–Jun semi,
// Jul–Sep panas, Okt–Des gugur. Dihitung dari tanggal server saat render.
export function musimBerjalan(tanggal = new Date()): {
  musim: Musim;
  tahun: number;
} {
  const bulan = tanggal.getMonth();
  const tahun = tanggal.getFullYear();
  if (bulan <= 2) return { musim: "WINTER", tahun };
  if (bulan <= 5) return { musim: "SPRING", tahun };
  if (bulan <= 8) return { musim: "SUMMER", tahun };
  return { musim: "FALL", tahun };
}

export function labelMusim(musim: Musim, tahun: number): string {
  return `${NAMA_MUSIM[musim]} ${tahun}`;
}

export function episodeTampil(anime: AnimeRingkas): string {
  const berikutnya = anime.nextAiringEpisode?.episode;
  if (berikutnya !== null && berikutnya !== undefined) {
    return `Ep ${berikutnya} berikutnya`;
  }
  if (anime.episodes !== null) return `${anime.episodes} episode`;
  return "Episode belum tersedia";
}
