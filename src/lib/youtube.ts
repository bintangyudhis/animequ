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
// - Video promosi (cuplikan, trailer, teaser, PV, highlight)
//   selalu ditolak: itu bukan tontonan. Kasus nyata 3 Nov 2026:
//   Demon Slayer musim pertama tertanam "Cuplikan ... Babak
//   Pelatihan Hashira Eps 02".
// - Sumber pertama yang dinilai adalah INDEKS PLAYLIST resmi
//   kanal (playlists.list, 415 playlist per Nov 2026): kanal
//   mengelompokkan tiap seri jadi playlist episode, jadi temuan
//   dari sini selalu berjenis playlist dan tombolnya mengarah
//   langsung ke playlist itu di YouTube, bukan ke kanal. Indeks
//   berharga 1 unit per halaman (50 playlist) dan ter-cache 30
//   hari, jadi praktis gratis dibanding pencarian (100 unit).
//   Pencarian tetap dipakai sebagai lapis kedua untuk judul yang
//   playlistnya tidak lolos saring, mis. yang hanya punya video
//   kompilasi "Semua Episode" atau episode lepas.
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

// Semua token judul hasil tanpa memotong ekor episode, untuk
// uji kelengkapan patokan: akhiran format pada judul AniList
// (OVA, OAD) bisa berpindah ke segmen episode di judul kanal,
// mis. patokan "...Slime OAD" dan hasil "...Slime - Episode
// OAD 01". Inti yang terpotong kehilangan kata OAD-nya, jadi
// kelengkapan harus dinilai dari judul penuh.
function tokenPenuh(judulHasil: string): string[] {
  const teks = judulHasil
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ");
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
  if (/\b(cuplikan|trailer|teaser|preview|pv|highlight)\b/i.test(mentah)) {
    return false;
  }

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
    // Jangkar TIDAK berlaku untuk MOVIE: dua movie dari seri yang
    // sama berbagi jangkar seri yang sama, jadi jangkar tidak bisa
    // membedakan movie satu dari movie lainnya. Kasus nyata yang
    // dicegah di sini: movie Scarlet Bond (2022) dan movie Tensura
    // kedua (2026) sama-sama berjudul Indonesia dan sama-sama
    // lolos gerbang format; hanya satu yang benar untuk entri ini.
    if (formatBersih === "MOVIE") return false;
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
  // ada di judul PENUH (akhiran format patokan bisa duduk di
  // segmen episode hasil, lihat tokenPenuh) DAN tidak boleh ada
  // kata asing di luar patokan, ekor sah, dan kata penanda
  // struktural (ep, eps, misi). Cakupan penuh saja tidak cukup,
  // karena nama arc musim lain bisa menumpang di ekor judul,
  // seperti kasus Demon Slayer.
  const tokenPatokan = new Set(tokenJudul(judulPatokan));
  const diizinkan = new Set([
    ...tokenPatokan,
    ...EKOR_SAH,
    ...Object.keys(ANGKA_KATA),
    "ep",
    "eps",
    "misi",
  ]);
  const tokenHasil = tokenPenuh(mentah);
  const patokanLengkap = [...tokenPatokan].every((kata) =>
    tokenHasil.includes(kata),
  );
  const tanpaKataAsing = tokenHasil.every(
    (kata) => diizinkan.has(kata) || /^\d+$/.test(kata),
  );
  return patokanLengkap && tanpaKataAsing;
}

// Durasi ISO 8601 dari API ("PT1H47M32S") menjadi detik.
function durasiDetik(iso: string): number {
  const cocok = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!cocok) return 0;
  return (
    Number(cocok[1] ?? 0) * 3600 +
    Number(cocok[2] ?? 0) * 60 +
    Number(cocok[3] ?? 0)
  );
}

// Gerbang durasi untuk kandidat video: tontonan asli berdurasi
// panjang (episode sekitar 24 menit, kompilasi berjam-jam),
// sedangkan PV, CM, cuplikan, preview, dan highlight hampir selalu
// di bawah 10 menit. Judul saja tidak cukup membedakan keduanya,
// durasi fisiknya yang membedakan. Satu panggilan videos.list
// berharga 1 unit untuk sampai 50 video sekaligus. Bila panggilan
// ini gagal, kandidat dipertahankan apa adanya: gerbang judul
// tetap menjadi saringan utama dan durasi hanya lapis kedua.
const DURASI_MINIMUM_DETIK = 600;

async function saringDurasi(
  kandidat: ItemCari[],
  kunci: string,
): Promise<ItemCari[]> {
  const ids = kandidat
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));
  if (ids.length === 0) return kandidat;
  try {
    const parameter = new URLSearchParams({
      part: "contentDetails",
      id: ids.join(","),
      key: kunci,
    });
    const respons = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${parameter}`,
      {
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 2592000 },
      },
    );
    if (!respons.ok) return kandidat;
    const json = (await respons.json()) as {
      items?: { id?: string; contentDetails?: { duration?: string } }[];
    };
    const peta = new Map<string, number>();
    for (const item of json.items ?? []) {
      if (item.id && item.contentDetails?.duration) {
        peta.set(item.id, durasiDetik(item.contentDetails.duration));
      }
    }
    if (peta.size === 0) return kandidat;
    return kandidat.filter((item) => {
      const detik = item.id?.videoId ? peta.get(item.id.videoId) : undefined;
      return detik === undefined || detik >= DURASI_MINIMUM_DETIK;
    });
  } catch {
    return kandidat;
  }
}

// Satu pencarian mentah ke API, item dikembalikan apa adanya.
// Penilaian kecocokan dilakukan terpisah oleh pilihTemuan, supaya
// item dari semua kueri bisa digabung dulu lalu dinilai terhadap
// judul patokan yang sebenarnya, bukan terhadap kata kuncinya.
async function ambilItem(kunci: string, kueri: string): Promise<ItemCari[]> {
  const parameter = new URLSearchParams({
    part: "snippet",
    channelId: ID_KANAL_MUSE_INDONESIA,
    q: kueri,
    type: "video,playlist",
    // 25 hasil per pencarian: biaya unit API sama untuk jumlah
    // berapa pun sampai 50, dan 8 terbukti terlalu sempit karena
    // hasil teratas sering dikuasai seri lain atau musim lain.
    maxResults: "25",
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
    if (!respons.ok) return [];
    const json = (await respons.json()) as ResponsCari;
    return json.items ?? [];
  } catch {
    return [];
  }
}

type ItemPlaylist = {
  id?: string;
  snippet?: { title?: string };
};

type ResponsPlaylist = {
  items?: ItemPlaylist[];
  nextPageToken?: string;
};

// Indeks playlist resmi kanal dari playlists.list. Berbeda dengan
// pencarian yang peringkatnya bisa dikuasai seri lain, daftar ini
// adalah inventaris lengkap kanal, jadi judul yang memang tidak
// ditayangkan kanal tidak akan muncul di sini sama sekali
// (terbukti Nov 2026: Jujutsu Kaisen, Solo Leveling, dan Chainsaw
// Man nol playlist). Tiap halaman berharga 1 unit dan ter-cache
// 30 hari seperti pencarian.
async function ambilIndeksPlaylist(kunci: string): Promise<ItemCari[]> {
  const semua: ItemCari[] = [];
  let token: string | undefined;
  // Pengaman 20 halaman (1.000 playlist); kanal saat ini 415.
  for (let halaman = 0; halaman < 20; halaman++) {
    const parameter = new URLSearchParams({
      part: "snippet",
      channelId: ID_KANAL_MUSE_INDONESIA,
      maxResults: "50",
      key: kunci,
    });
    if (token) parameter.set("pageToken", token);
    try {
      const respons = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?${parameter}`,
        {
          signal: AbortSignal.timeout(10000),
          next: { revalidate: 2592000 },
        },
      );
      if (!respons.ok) break;
      const json = (await respons.json()) as ResponsPlaylist;
      for (const item of json.items ?? []) {
        if (!item.id) continue;
        semua.push({
          id: { kind: "youtube#playlist", playlistId: item.id },
          snippet: {
            title: item.snippet?.title ?? "",
            channelId: ID_KANAL_MUSE_INDONESIA,
          },
        });
      }
      token = json.nextPageToken;
      if (!token) break;
    } catch {
      break;
    }
  }
  return semua;
}

// Nilai kumpulan item terhadap SATU judul patokan dan pilih
// temuan terbaiknya: playlist resmi dulu, lalu video "Semua
// Episode", lalu episode 1, lalu video lolos pertama.
async function pilihTemuan(
  semuaItem: ItemCari[],
  kunci: string,
  format: string | null,
  judulPatokan: string,
  musimPatokan: number | null,
  sinonim: string[],
  jumlahEpisode: number | null,
): Promise<TemuanMuse | null> {
  const lolos = semuaItem.filter((item) =>
    layak(item, format, judulPatokan, musimPatokan, sinonim, jumlahEpisode),
  );
  const bersih = dekode;
  const playlist = lolos.find(
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
  const video = await saringDurasi(
    lolos.filter(
      (item) => item.id?.kind === "youtube#video" && item.id.videoId,
    ),
    kunci,
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
  // Semua ejaan dicoba sampai ada yang lolos saring: judul Inggris,
  // judul romaji, lalu sinonim khas sebagai kata kunci pencarian
  // (kanal bisa memakai judul alternatif resmi, mis. nama pendek
  // serinya). Total dibatasi 4 pencarian per judul, dan tiap query
  // ter-cache 30 hari, jadi biayanya tetap kecil.
  const kueriSinonim = sinonimJangkar
    .filter((s) => padatkan(s).length >= 5)
    .slice(0, 2);
  const semuaKueri = [...new Set([...urutan, ...kueriSinonim])].slice(0, 4);
  // Indeks playlist dinilai sebelum pencarian apa pun: temuan dari
  // sini selalu playlist resmi seri itu, jadi pemutarnya memutar
  // seluruh episode berurutan dan tombolnya membuka playlistnya
  // langsung, sesuai permintaan Yudhis 5 Nov 2026 agar tautan
  // tidak berhenti di kanal.
  const indeksPlaylist = await ambilIndeksPlaylist(kunci);
  if (indeksPlaylist.length > 0) {
    for (const patokan of urutan) {
      const temuan = await pilihTemuan(
        indeksPlaylist,
        kunci,
        format,
        patokan,
        musimPatokan,
        sinonimJangkar,
        jumlahEpisode,
      );
      if (temuan) return temuan;
    }
  }
  // Item dari semua kueri digabung (dedupe per ID hasil) lalu
  // dinilai terhadap tiap patokan. Kueri dijalankan satu per satu
  // dan penilaian diulang tiap ada kumpulan baru, supaya judul
  // yang mudah ketemu tidak membayar kueri tambahan.
  const terkumpul: ItemCari[] = [];
  const sudahAda = new Set<string>();
  for (const kueri of semuaKueri) {
    const itemBaru = await ambilItem(kunci, kueri);
    for (const item of itemBaru) {
      const idHasil = item.id?.videoId ?? item.id?.playlistId ?? "";
      if (idHasil && sudahAda.has(idHasil)) continue;
      if (idHasil) sudahAda.add(idHasil);
      terkumpul.push(item);
    }
    for (const patokan of urutan) {
      const temuan = await pilihTemuan(
        terkumpul,
        kunci,
        format,
        patokan,
        musimPatokan,
        sinonimJangkar,
        jumlahEpisode,
      );
      if (temuan) return temuan;
    }
  }
  return null;
}
