// Peta genre resmi AniList (enum MediaGenre) ke slug URL.
// Nama genre harus persis ejaan AniList karena dikirim apa adanya ke
// variabel genre_in; slug hanya untuk alamat halaman /genre/<slug>.
// Genre tanpa jalur resmi tidak dibuatkan halaman: slug tak dikenal
// dijawab 404 oleh halaman genre.

export type GenreAnime = {
  nama: string;
  slug: string;
};

export const DAFTAR_GENRE: GenreAnime[] = [
  { nama: "Action", slug: "action" },
  { nama: "Adventure", slug: "adventure" },
  { nama: "Comedy", slug: "comedy" },
  { nama: "Drama", slug: "drama" },
  { nama: "Fantasy", slug: "fantasy" },
  { nama: "Horror", slug: "horror" },
  { nama: "Mahou Shoujo", slug: "mahou-shoujo" },
  { nama: "Mecha", slug: "mecha" },
  { nama: "Music", slug: "music" },
  { nama: "Mystery", slug: "mystery" },
  { nama: "Psychological", slug: "psychological" },
  { nama: "Romance", slug: "romance" },
  { nama: "Sci-Fi", slug: "sci-fi" },
  { nama: "Slice of Life", slug: "slice-of-life" },
  { nama: "Sports", slug: "sports" },
  { nama: "Supernatural", slug: "supernatural" },
  { nama: "Thriller", slug: "thriller" },
];

export function genreDariSlug(slug: string): GenreAnime | null {
  return DAFTAR_GENRE.find((genre) => genre.slug === slug) ?? null;
}

export function slugDariNama(nama: string): string | null {
  return DAFTAR_GENRE.find((genre) => genre.nama === nama)?.slug ?? null;
}
