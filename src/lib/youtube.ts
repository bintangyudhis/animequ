// Pencarian video dan playlist LANGSUNG di kanal YouTube Muse
// Indonesia (@MuseIndonesia) lewat YouTube Data API v3 resmi.
//
// Kunci API dibaca dari env server YOUTUBE_API_KEY (dipasang di
// Vercel, tidak pernah di repo). Tanpa kunci, atau bila API gagal,
// fungsi mengembalikan null dan halaman detail jatuh kembali ke
// tautan pencarian di dalam kanal. Pencarian selalu dibatasi ke
// channelId kanal resmi ini dan hasilnya disaring lagi per item.
//
// Penyaringan dibuat ketat (lebih baik tidak menampilkan tautan
// langsung daripada menautkan video yang salah):
// - Judul hasil harus memuat sebagian besar kata penting judul
//   anime-nya, dan inti judulnya harus diawali judul anime itu:
//   spin-off seperti "The Slime Diaries" gugur karena ekor judul
//   hasil lebih panjang dari judul aslinya.
// - Format AniList judul ini menentukan penanda yang diizinkan:
//   entri TV menolak hasil berpenanda OVA/ONA/movie/special,
//   entri MOVIE hanya menerima hasil movie, entri OVA hanya OVA.
// - Musim harus sejalan: entri musim pertama menolak hasil
//   berpenanda musim 2+, entri musim ke-N hanya menerima hasil
//   berpenanda musim yang sama.
// - Video promosi (cuplikan, trailer, teaser, PV) selalu ditolak:
//   itu bukan tontonan. Kasus nyata 3 Nov 2026: Demon Slayer musim
//   pertama tertanam "Cuplikan ... Babak Pelatihan Hashira Eps 02".
// - Kata asing di luar judul patokan dan ekor sah selalu ditolak,
//   jadi nama arc atau musim lain tidak bisa menumpang lolos lewat
//   cakupan kata saja (perbaikan kasus yang sama).

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
  snippet?: { title?: string; channelId?: string };
};

type ResponsCari = { items?: ItemCari[] };

function kataPenting(judul: string): string[] {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((kata) => kata.length >= 3);
}

function cakupanKata(judulHasil: string, judulAnime: string): number {
  const kata = kataPenting(judulAnime);
  if (kata.length === 0) return 0;
  const teks = judulHasil.toLowerCase();
  const kena = kata.filter((k) => teks.includes(k)).length;
  return kena / kata.length;
}

// Judul tanpa spasi dan tanda baca sama sekali, untuk perbandingan
// inti: "SPY x FAMILY" dan "SPYxFAMILY" dianggap sama.
function padatkan(teks: string): string {
  return teks.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Inti judul hasil: buang segmen kurung, potong ekor episode
// (" - Episode 01", " Episode 3", dst), sisakan nama serinya saja.
function intiHasil(judulHasil: string): string {
  let teks = judulHasil.toLowerCase();
  teks = teks.replace(/\[[^\]]*\]/g, " ").replace(/\([^)]*\)/g, " ");
  teks = teks.split(/\s+-\s+(?=(episode|ep|eps|misi|#))/)[0];
  teks = teks.split(/\s+(?=(episode|ep|eps|misi)\s*\d)/)[0];
  return padatkan(teks);
}

type Penanda = {
  ova: boolean;
  ona: boolean;
  movie: boolean;
  special: boolean;
  musim: number | null;
};

const ANGKA_KATA: Record<string, number> = {
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
};

function penandaDari(judul: string): Penanda {
  const teks = ` ${judul.toLowerCase()} `;
  let musim: number | null = null;
  const polaAngka =
    /(?:season|musim)(?:\s*ke)?\s*-?\s*(\d+)|\b(\d+)(?:nd|rd|th)\s*season|\bs\s*-?\s*(\d)\b/;
  const cocokAngka = teks.match(polaAngka);
  if (cocokAngka) {
    musim = Number(cocokAngka[1] ?? cocokAngka[2] ?? cocokAngka[3]);
  } else {
    const cocokKata = teks.match(/(?:season|musim)\s*ke\s*(dua|tiga|empat|lima|enam)/);
    if (cocokKata) musim = ANGKA_KATA[cocokKata[1]];
  }
  return {
    ova: /\b(ova|oad)\b/.test(teks),
    ona: /\bona\b/.test(teks),
    movie: /\b(movie|film)\b/.test(teks) || teks.includes("gekijouban"),
    special: /\b(special|spesial)\b/.test(teks),
    musim,
  };
}

// Kata yang boleh muncul sebagai ekor inti judul hasil setelah
// judul anime-nya: penanda musim dan format yang sah.
const EKOR_SAH = [
  "season",
  "musim",
  "ke",
  "part",
  "the",
  "movie",
  "film",
  "ova",
  "oad",
  "ona",
  "special",
  "spesial",
  "semua",
  "episode",
  "full",
  "cour",
];

function ekorSah(tekor: string): boolean {
  let sisa = tekor;
  for (const kata of [...EKOR_SAH, ...Object.keys(ANGKA_KATA)]) {
    sisa = sisa.split(kata).join("");
  }
  sisa = sisa.replace(/[0-9]/g, "");
  return sisa.length <= 2;
}

// Kata inti judul hasil dalam bentuk token, untuk uji ketat:
// semua token hasil harus berasal dari judul patokan atau daftar
// ekor sah. "Babak Pelatihan Hashira" gugur di sini karena babak,
// pelatihan, dan hashira bukan bagian judul "Kimetsu no Yaiba".
function tokenInti(judulHasil: string): string[] {
  let teks = judulHasil.toLowerCase();
  teks = teks.replace(/\[[^\]]*\]/g, " ").replace(/\([^)]*\)/g, " ");
  teks = teks.split(/\s+-\s+(?=(episode|ep|eps|misi|#))/)[0];
  teks = teks.split(/\s+(?=(episode|ep|eps|misi)\s*\d)/)[0];
  return teks.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function tokenJudul(judul: string): string[] {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Judul dari API datang ter-escape HTML (&#39; untuk apostrof).
// Dekode dulu sebelum pencocokan, kalau tidak inti judul seperti
// "Journey's End" tidak akan pernah sama dengan patokannya.
function dekode(teks: string): string {
  return teks
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Nomor episode eksplisit di judul hasil, mis. "Episode 89".
// Kanal memakai penomoran berlanjut antar musim, jadi nomor yang
// melebihi jumlah episode entri ini pasti milik musim lain.
function nomorEpisodeDari(judul: string): number | null {
  const cocok = judul.toLowerCase().match(/\b(?:episode|ep|eps|misi)\.?\s*(\d+)/);
  return cocok ? Number(cocok[1]) : null;
}

// Jangkar sinonim: kanal kadang menamai seri dengan judul
// terjemahan Indonesia plus nama pendek resminya, mis. Slime jadi
// "(Tensura) Bereinkarnasi Malah Menjadi Slime", yang tidak memuat
// satu pun kata judul AniList. Sinonim khas dari AniList (dipadatkan
// minimal 5 huruf) yang muncul di judul hasil menjadi bukti
// identitas serinya, selama semua gerbang lain sudah lolos.
function jangkarSinonim(judulHasil: string, sinonim: string[]): boolean {
  const padatHasil = padatkan(judulHasil);
  return sinonim.some((s) => {
    const padat = padatkan(s);
    return padat.length >= 5 && padatHasil.includes(padat);
  });
}

// Satu hasil dianggap layak bila lolos semua gerbang: kanal benar,
// format sejalan, musim sejalan, nomor episode tidak melebihi
// jumlah episode entri ini, dan identitas serinya terbukti, entah
// lewat inti judul yang cocok dengan patokan, atau lewat jangkar
// sinonim untuk judul kanal yang berbahasa lain.
function layak(
  item: ItemCari,
  format: string | null,
  judulPatokan: string,
  musimPatokan: number | null,
  sinonim: string[] = [],
  jumlahEpisode: number | null = null,
): boolean {
  const mentah = item.snippet?.title ? dekode(item.snippet.title) : null;
  if (!mentah) return false;
  if (item.snippet?.channelId !== ID_KANAL_MUSE_INDONESIA) return false;
  // Video promosi bukan tontonan: kanal menamai trailer resminya
  // "Cuplikan ...", dan kasus Demon Slayer 3 Nov 2026 membuktikan
  // cuplikan bisa lolos semua gerbang lain.
  if (/\b(cuplikan|trailer|teaser|preview|pv)\b/i.test(mentah)) return false;

  const penanda = penandaDari(mentah);
  const formatBersih = (format ?? "TV").toUpperCase();
  if (formatBersih === "MUSIC" || formatBersih === "CM" || formatBersih === "PV") {
    return false;
  }
  if (formatBersih === "MOVIE") {
    if (penanda.ova || penanda.ona) return false;
    const patokanMovie = /\b(movie|film)\b/i.test(judulPatokan);
    if (!penanda.movie && !patokanMovie) return false;
  } else if (formatBersih === "OVA") {
    if (!penanda.ova) return false;
  } else if (formatBersih === "ONA") {
    if (!penanda.ona) return false;
  } else if (formatBersih === "SPECIAL") {
    if (!penanda.special && !penanda.ova) return false;
  } else {
    // TV, TV_SHORT, dan format lain: hanya seri utamanya.
    if (penanda.ova || penanda.ona || penanda.movie || penanda.special) {
      return false;
    }
  }

  // Musim: patokan tanpa musim berarti musim pertama.
  const musimAnime = musimPatokan ?? 1;
  if (penanda.musim !== null && penanda.musim !== musimAnime) return false;
  if (musimAnime > 1 && penanda.musim === null) {
    // Entri musim lanjutan: hasil tanpa penanda musim hanya diterima
    // bila inti judulnya sendiri memuat penanda musimnya, mis.
    // judul romaji "xxx 2nd Season" yang memang menyatu di inti.
    if (!intiHasil(mentah).startsWith(padatkan(judulPatokan))) return false;
  }

  // Nomor episode: penomoran kanal berlanjut antar musim, jadi
  // nomor di atas jumlah episode entri ini pasti musim lain.
  const nomorEp = nomorEpisodeDari(mentah);
  if (nomorEp !== null && jumlahEpisode !== null && nomorEp > jumlahEpisode) {
    return false;
  }

  // Bila kata judul hasil nyaris tidak beririsan dengan patokan,
  // judul kanal kemungkinan memakai bahasa atau terjemahan lain:
  // identitasnya hanya bisa dibuktikan jangkar sinonim.
  if (cakupanKata(mentah, judulPatokan) < 0.6) {
    return jangkarSinonim(mentah, sinonim);
  }

  // Inti: harus diawali judul patokan dengan ekor yang sah, supaya
  // spin-off dan seri sempalan tidak lolos.
  const inti = intiHasil(mentah);
  const padatPatokan = padatkan(judulPatokan);
  if (inti.startsWith(padatPatokan)) {
    return ekorSah(inti.slice(padatPatokan.length));
  }
  // Jalan terakhir (urutan kata berbeda): semua kata patokan harus
  // ada DAN tidak boleh ada kata asing di luar patokan dan ekor
  // sah. Cakupan penuh saja tidak cukup, karena nama arc musim
  // lain bisa menumpang di ekor judul, seperti kasus Demon Slayer.
  const tokenPatokan = new Set(tokenJudul(judulPatokan));
  const diizinkan = new Set([
    ...tokenPatokan,
    ...EKOR_SAH,
    ...Object.keys(ANGKA_KATA),
  ]);
  const tokenHasil = tokenInti(mentah);
  const patokanLengkap = [...tokenPatokan].every((kata) =>
    tokenHasil.includes(kata),
  );
  const tanpaKataAsing = tokenHasil.every(
    (kata) => diizinkan.has(kata) || /^\d+$/.test(kata),
  );
  return patokanLengkap && tanpaKataAsing;
}

async function cariSekali(
  kunci: string,
  judul: string,
  format: string | null,
  musimPatokan: number | null,
  sinonim: string[] = [],
  jumlahEpisode: number | null = null,
): Promise<{ temuan: TemuanMuse | null; jumlahItem: number }> {
  const parameter = new URLSearchParams({
    part: "snippet",
    channelId: ID_KANAL_MUSE_INDONESIA,
    q: judul,
    type: "video,playlist",
    maxResults: "8",
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
        // Cache 30 hari (pilihan Yudhis 2 Nov 2026): pencarian API
        // berharga mahal (100 unit dari kuota harian 10.000), jadi
        // tiap judul cukup dicarikan sekali sebulan. Konsekuensinya
        // judul yang baru ditambahkan Muse Indonesia bisa telat
        // tampil sampai cache judul itu kedaluwarsa.
        next: { revalidate: 2592000 },
      },
    );
    if (!respons.ok) return { temuan: null, jumlahItem: 0 };
    const json = (await respons.json()) as ResponsCari;
    const semuaItem = json.items ?? [];
    const lolos = semuaItem.filter((item) =>
      layak(item, format, judul, musimPatokan, sinonim, jumlahEpisode),
    );
    const bersih = dekode;
    const playlist = lolos.find(
      (item) => item.id?.kind === "youtube#playlist" && item.id.playlistId,
    );
    if (playlist) {
      return {
        temuan: {
          url: `https://www.youtube.com/playlist?list=${playlist.id?.playlistId}`,
          judulHasil: bersih(playlist.snippet?.title ?? ""),
          jenis: "playlist",
          id: playlist.id?.playlistId ?? "",
        },
        jumlahItem: semuaItem.length,
      };
    }
    const video = lolos.filter(
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
        temuan: {
          url: `https://www.youtube.com/watch?v=${pilihan.id?.videoId}`,
          judulHasil: bersih(pilihan.snippet?.title ?? ""),
          jenis: "video",
          id: pilihan.id?.videoId ?? "",
        },
        jumlahItem: semuaItem.length,
      };
    }
    return { temuan: null, jumlahItem: semuaItem.length };
  } catch {
    return { temuan: null, jumlahItem: 0 };
  }
}

export async function cariDiMuseIndonesia(
  judulRomaji: string,
  judulInggris: string | null,
  format: string | null,
  sinonim: string[] = [],
  jumlahEpisode: number | null = null,
): Promise<TemuanMuse | null> {
  const kunci = process.env.YOUTUBE_API_KEY;
  if (!kunci) return null;
  const musimPatokan =
    penandaDari(judulInggris ?? "").musim ??
    penandaDari(judulRomaji).musim;
  // Jangkar hanya untuk sinonim yang BENAR-BENAR berbeda dari
  // judul utama: sinonim yang sama atau beririsan dengan judul
  // romaji/Inggris dibuang, karena sinonim semacam itu bisa
  // mengesahkan judul sempalan satu bahasa yang ekornya berisi
  // nama arc lain. Kasus nyata 5 Nov 2026: playlist "Kimetsu no
  // Yaiba: Pembasmi Iblis (Babak Kereta Api Mugen) - Preview"
  // lolos jangkar untuk entri musim pertama.
  const padatRomaji = padatkan(judulRomaji);
  const padatInggris = judulInggris ? padatkan(judulInggris) : "";
  const sinonimJangkar = sinonim.filter((s) => {
    const padat = padatkan(s);
    if (padat.length < 5) return false;
    if (padatRomaji.includes(padat) || padat.includes(padatRomaji)) {
      return false;
    }
    if (
      padatInggris &&
      (padatInggris.includes(padat) || padat.includes(padatInggris))
    ) {
      return false;
    }
    return true;
  });
  const urutan = [judulInggris, judulRomaji].filter(
    (judul): judul is string => Boolean(judul),
  );
  // Kedua ejaan selalu dicoba sampai ada yang lolos saring: judul
  // di kanal bisa memakai ejaan romaji saat patokan Inggris tidak
  // cocok, dan sebaliknya. Biayanya aman karena tiap query ter-cache
  // 30 hari, jadi satu judul maksimal 2 pencarian per bulan.
  for (const judul of [...new Set(urutan)]) {
    const { temuan } = await cariSekali(
      kunci,
      judul,
      format,
      musimPatokan,
      sinonimJangkar,
      jumlahEpisode,
    );
    if (temuan) return temuan;
  }
  return null;
}
