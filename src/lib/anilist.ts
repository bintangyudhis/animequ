// Tipe minimal dari respons AniList untuk kartu dan daftar.
// Hanya field yang benar-benar dirender yang dideklarasikan.

export type JudulAnime = {
  romaji: string | null;
  english: string | null;
};

export type AnimeRingkas = {
  id: number;
  title: JudulAnime;
  coverImage: { large: string | null };
  averageScore: number | null;
  episodes: number | null;
  genres: string[] | null;
  siteUrl: string | null;
  seasonYear: number | null;
  nextAiringEpisode: { episode: number } | null;
};

export function judulTampil(anime: AnimeRingkas): string {
  return anime.title.romaji ?? anime.title.english ?? "Judul belum tersedia";
}

export function skorTampil(anime: AnimeRingkas): string {
  if (anime.averageScore === null) return "—";
  return (anime.averageScore / 10).toFixed(1);
}
