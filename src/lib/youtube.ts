// Pencarian video dan playlist LANGSUNG di kanal YouTube Muse
// Indonesia (@MuseIndonesia) lewat YouTube Data API v3 resmi.
//
// Kunci API dibaca dari env server YOUTUBE_API_KEY (dipasang di
// Vercel, tidak pernah di repo). Tanpa kunci, atau bila API gagal,
// fungsi mengembalikan null dan halaman detail jatuh kembali ke
// tautan pencarian di dalam kanal. Pencarian selalu dibatasi ke
// channelId kanal resmi ini, jadi hasil tidak mungkin berasal dari
// kanal lain.
//
// Judul dicoba dua ejaan: Inggris dulu (kanal ini kebanyakan memakai
// judul Inggris), romaji sebagai cadangan. Hasil dianggap cocok
// hanya bila judul video/playlist memuat sebagian besar kata
// penting judul anime-nya, supaya tidak menautkan video yang salah.

const ID_KANAL_MUSE_INDONESIA = "UCxxnxya_32jcKj4yN1_kD7A";

export type TemuanMuse = {
  url: string;
  judulHasil: string;
  jenis: "video" | "playlist";
  // ID mentah hasil API: dipakai pemutar embed resmi YouTube di
  // halaman detail, supaya pengunjung bisa menonton tanpa pindah
  // situs (videonya tetap dari server YouTube).
  id: string;
};

type ItemCari = {
  id?: { kind?: string; videoId?: string; playlistId?: string };
  snippet?: { title?: string };
};

type ResponsCari = { items?: ItemCari[] };

function kataPenting(judul: string): string[] {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((kata) => kata.length >= 3);
}

function cocok(judulHasil: string, judulAnime: string): boolean {
  const kata = kataPenting(judulAnime);
  if (kata.length === 0) return false;
  const teks = judulHasil.toLowerCase();
  const kena = kata.filter((k) => teks.includes(k)).length;
  return kena / kata.length >= 0.6;
}

async function cariSekali(
  kunci: string,
  judul: string,
): Promise<TemuanMuse | null> {
  const parameter = new URLSearchParams({
    part: "snippet",
    channelId: ID_KANAL_MUSE_INDONESIA,
    q: judul,
    type: "video,playlist",
    maxResults: "6",
    // WAJIB regionCode ID: tanpa ini, API menyaring hasil menurut
    // wilayah IP pemanggil dan video Muse Indonesia (lisensi
    // Indonesia) tidak muncul sama sekali dari server luar negeri.
    regionCode: "ID",
    relevanceLanguage: "id",
    key: kunci,
  });
  try {
    const respons = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${parameter}`,
      {
        signal: AbortSignal.timeout(10000),
        // Cache sehari: ketersediaan video satu judul nyaris tidak
        // berubah dalam sehari, dan kuota API harian terjaga.
        next: { revalidate: 86400 },
      },
    );
    if (!respons.ok) return null;
    const json = (await respons.json()) as ResponsCari;
    const cocokSemua = (json.items ?? []).filter(
      (item) => item.snippet?.title && cocok(item.snippet.title, judul),
    );
    const bersih = (teks: string) =>
      teks
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    const playlist = cocokSemua.find(
      (item) => item.id?.kind === "youtube#playlist" && item.id.playlistId,
    );
    if (playlist) {
      return {
        url: `https://www.youtube.com/playlist?list=${playlist.id?.playlistId}`,
        judulHasil: bersih(playlist.snippet?.title ?? ""),
        jenis: "playlist",
        id: playlist.id?.playlistId ?? "",
      };
    }
    const video = cocokSemua.filter(
      (item) => item.id?.kind === "youtube#video" && item.id.videoId,
    );
    // Kanal ini sering mengunggah satu video "Semua Episode" berisi
    // satu musim penuh: itu target nonton terbaik setelah playlist.
    const semuaEpisode = video.find((item) =>
      /semua episode/i.test(item.snippet?.title ?? ""),
    );
    const episodeSatu = video.find((item) =>
      /\b(ep|eps|episode|misi)\.?\s*0?1\b/i.test(item.snippet?.title ?? ""),
    );
    const pilihan = semuaEpisode ?? episodeSatu ?? video[0];
    if (pilihan) {
      return {
        url: `https://www.youtube.com/watch?v=${pilihan.id?.videoId}`,
        judulHasil: bersih(pilihan.snippet?.title ?? ""),
        jenis: "video",
        id: pilihan.id?.videoId ?? "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function cariDiMuseIndonesia(
  judulRomaji: string,
  judulInggris: string | null,
): Promise<TemuanMuse | null> {
  const kunci = process.env.YOUTUBE_API_KEY;
  if (!kunci) return null;
  const urutan = [judulInggris, judulRomaji].filter(
    (judul): judul is string => Boolean(judul),
  );
  for (const judul of [...new Set(urutan)]) {
    const temuan = await cariSekali(kunci, judul);
    if (temuan) return temuan;
  }
  return null;
}
