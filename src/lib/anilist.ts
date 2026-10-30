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

export type AnimeDetail = AnimeRingkas & {
  description: string | null;
  format: string | null;
  status: string | null;
  bannerImage: string | null;
  trailer: { id: string | null; site: string | null } | null;
  studios: { nodes: { name: string | null }[] | null } | null;
  externalLinks: { url: string | null; site: string | null; type: string | null }[] | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
};

export function skorTampil(anime: AnimeRingkas): string {
  if (anime.averageScore === null) return "—";
  return (anime.averageScore / 10).toFixed(1);
}

const TITIK_AKHIR = "https://graphql.anilist.co";

const FRAGMEN_ANIME = `
  id
  title { romaji english }
  coverImage { large }
  averageScore
  episodes
  genres
  siteUrl
  seasonYear
  nextAiringEpisode { episode }
`;

type ResponsAniList = {
  data?: { Page?: { media?: AnimeRingkas[] } };
};

// Satu-satunya jalur keluar ke API eksternal: POST ke endpoint AniList yang
// tetap, tanpa kunci dan tanpa data pengguna. Gagal fetch (mis. AniList
// membatasi bot) tidak boleh menggagalkan render: pemanggil menerima null
// dan menampilkan pesan gagal muat, bukan halaman kosong.
async function ambilDaftar(
  query: string,
  variables: Record<string, unknown>,
): Promise<AnimeRingkas[] | null> {
  try {
    const respons = await fetch(TITIK_AKHIR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      // Batas 15 detik: AniList yang menggantung (mis. diblokir Cloudflare
      // dari IP build) tidak boleh menggantung build/render — pemanggil
      // menerima null dan menampilkan pesan gagal muat.
      signal: AbortSignal.timeout(15000),
      // Cache 30 menit: cukup segar untuk daftar, hemat kuota AniList.
      next: { revalidate: 1800 },
    });
    if (!respons.ok) return null;
    const json = (await respons.json()) as ResponsAniList;
    return json.data?.Page?.media ?? null;
  } catch {
    return null;
  }
}

export function daftarSedangTayang(): Promise<AnimeRingkas[] | null> {
  return ambilDaftar(
    `query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
          ${FRAGMEN_ANIME}
        }
      }
    }`,
    { perPage: 12 },
  );
}

export function daftarTrending(): Promise<AnimeRingkas[] | null> {
  return ambilDaftar(
    `query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          ${FRAGMEN_ANIME}
        }
      }
    }`,
    { perPage: 10 },
  );
}

export function daftarMusim(
  season: string,
  seasonYear: number,
): Promise<AnimeRingkas[] | null> {
  return ambilDaftar(
    `query ($perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(perPage: $perPage) {
        media(
          type: ANIME
          season: $season
          seasonYear: $seasonYear
          sort: POPULARITY_DESC
        ) {
          ${FRAGMEN_ANIME}
        }
      }
    }`,
    { perPage: 12, season, seasonYear },
  );
}
