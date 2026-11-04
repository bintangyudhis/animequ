## Pelajaran Day 11 (Next.js 16 + AniList)

- Repo sudah dibuat 27 Okt saat perapihan repo (hanya README + LICENSE);
  Day 11 mengisi scaffold + client GraphQL + beranda, tanpa perlu buat
  repo baru lewat browser. Issues rencana sudah ada (#1 scaffold +
  client, #2 beranda, #3 detail + pencarian, #4 favorit, #5 jadwal +
  chart, #6 histori, #7 polish).
- AniList dari VM ini DIBLOKIR Cloudflare ("Attention Required") lewat
  curl, baik dengan maupun tanpa User-Agent browser — kemungkinan
  deteksi bot atas IP egress VM. Karena itu fetch server dibungkus
  try/catch dan mengembalikan null: build lolos dan halaman menampilkan
  PesanGagal yang jujur, bukan halaman kosong. Di Vercel (IP produksi
  normal) fetch yang sama semestinya lolos; verifikasi lewat deploy
  harian Day 11.
- Pola pendekin Day 6 dipakai lagi: `cacheComponents: true` + komponen
  server async di dalam `<Suspense>` (Partial Prerender) — jangan pakai
  `export const dynamic` di page root, build akan gagal.
- Cache fetch `revalidate: 1800` (30 menit) per daftar; tiga seksi
  mengambil tiga query terpisah supaya satu gagal tidak meruntuhkan
  yang lain.
- Tema "Layar": kertas gelap hangat (#16120e), aksen vermilion
  (#ff4d24), tanpa gradasi, tanpa emoji, tanpa angka karangan.
  Struktur beranda sengaja tidak seragam: grid kartu untuk ongoing +
  musim, daftar peringkat bernomor untuk trending.
- Kartu untuk sementara menaut keluar ke halaman AniList judul itu
  (siteUrl); halaman detail lokal adalah fitur Day 12.

## Pelajaran Day 12 (pencarian + detail + favorit)

- Issue #3 (detail + pencarian) dan #4 (favorit) ditutup lewat commit
  yang memuat `Closes #3` / `Closes #4` di pesannya saat push ke main.
- Halaman detail memakai `notFound()` untuk id non-numerik dan detail
  null; route `/anime/[id]` dan `/cari` berstatus Partial Prerender (◐)
  di build, `/favorit` statis (daftar dibaca klien dari localStorage).
- Favorit: kunci `animequ-favorit-v1`, event `animequ:favorit` untuk
  sinkronisasi daftar antar komponen; tombol membaca localStorage di
  useEffect (bukan render server) supaya tidak ada hydration mismatch.
- Build Day 12 lolos cepat (~18 detik, 6 halaman) — tidak ada lagi
  timeout AniList 15 detik seperti Day 11; fetch detail/cari hanya jalan
  per request, bukan saat prerender.

## Pelajaran Day 13 (jadwal + chart + histori)

- Issue #5 (jadwal + chart) tertutup oleh commit query pertama Day 13
  yang memuat `Closes #5` — lebih awal dari selesainya fitur, karena
  penanda itu langsung menutup issue saat push. Pelajaran: tulis
  `Closes #n` hanya di commit terakhir fitur itu. Issue #6 (histori)
  ditutup lewat badan pesan commit deploy Day 13, setelah semua fitur
  histori selesai dan ter-push.
- Jadwal memakai query AiringSchedule AniList (airingAt_greater/lesser,
  sort TIME, 50 entri) + `await connection()` sebelum menghitung
  rentang 7 hari, pola yang sama seperti BagianMusim (new Date saat
  prerender ditolak Next 16). Pengelompokan per hari memakai kunci
  YYYY-MM-DD dalam WIB (Intl.DateTimeFormat Asia/Jakarta), bukan UTC.
- Histori meniru pola favorit (localStorage + event kustom
  `animequ:histori`, baca setelah mount, maks 50 entri, terbaru di
  depan, dedupe per id). Pencatatan lewat komponen klien tanpa tampilan
  di halaman detail, bukan di render server.
- Sapuan keamanan ringan Day 13: tidak ada permukaan baru yang perlu
  diaudit — tidak ada endpoint/auth/upload baru; hanya bacaan publik
  AniList (tanpa kunci, tanpa data pengguna) dan localStorage yang
  tidak pernah dikirim ke server. Tidak ada secret yang di-commit.

## Pelajaran Day 11 lanjutan (build beranda penuh)

- Fetch AniList WAJIB dibatasi waktu (`AbortSignal.timeout(15000)`):
  tanpa batas, koneksi yang menggantung dari IP build membuat prerender
  halaman gagal setelah 3x percobaan 60 detik. Dengan batas, gagal fetch
  menjadi null dan halaman menampilkan PesanGagal yang jujur.
- `new Date()` di `musimBerjalan()` DITOLAK saat prerender Next 16
  ("unstable value"): `BagianMusim` memakai `await connection()` dari
  `next/server` sebelum menghitung musim, sehingga seksi itu di-render
  per request di dalam Suspense (Partial Prerender tetap jalan, route
  `/` berstatus ◐). Jangan pakai `export const dynamic` di page root
  (ditolak bila `cacheComponents: true`, pelajaran pendekin Day 6).
- Build halaman penuh dari VM memakan ~15 detik di tahap prerender
  karena tiga fetch AniList menunggu timeout (IP VM diblokir
  Cloudflare); di Vercel fetch yang sama semestinya jauh lebih cepat.

## Pelajaran Day 14 (polish + sapuan keamanan penuh)

- Polish dikerjakan per berkas (26 commit kode + README + catatan
  ini), bukan satu commit besar: tiap berkas satu unit — fokus dan
  seleksi di globals, tautan lewati di layout, nav/footer, hero,
  judul seksi, kartu, grid, fallback/loading dalam panel, halaman
  detail (tautan kembali, rel noopener, judul bergaris), trailer,
  tautan resmi, tombol favorit, pencarian (maxLength 100 di bilah
  dan formulir), hasil cari, favorit/histori, jadwal, peringkat,
  trending, pintasan, dan pesan gagal berjudul.
- Repo sempat dalam keadaan HEAD detached di commit yang sama dengan
  main (e351699) — sebelum kerja, `git checkout main` dulu supaya
  commit baru tidak menggantung di detached HEAD.
- Sapuan keamanan penuh Day 14: histori git bersih dari secret
  (satu-satunya hit grep adalah kalimat prose "tidak ada secret"),
  tidak ada berkas .env yang ter-track, tidak ada
  `dangerouslySetInnerHTML` atau `NEXT_PUBLIC_*`, semua tautan
  eksternal kini `rel="noopener noreferrer"`, pencarian dibatasi
  100 karakter, fetch AniList hanya ke host tetap
  graphql.anilist.co (kata kunci hanya jadi variabel GraphQL, bukan
  URL), dan tidak ada endpoint/auth/upload sama sekali di situs ini.
  Satu celah verifikasi: `npm audit` gagal dari VM (endpoint audit
  registry ditolak proxy egress), jadi audit dependensi tidak
  terverifikasi — dicatat jujur di README, bukan diklaim lolos.
  Tidak ada dependensi baru pada Day 14, jadi risikonya tetap sama
  seperti Day 11–13.

## Pembaruan pasca Day 14 (2 Nov 2026, permintaan langsung Yudhis)

- Jelajah per genre: query `daftarPerGenre` (genre_in, POPULARITY_DESC,
  24 judul) + peta genre resmi di `src/lib/genre.ts` (17 genre enum
  MediaGenre ke slug). Nama genre dikirim apa adanya ke AniList, jadi
  ejaan di peta tidak boleh diubah bebas. Slug tak dikenal 404.
- Tombol nonton Crunchyroll: TautanResmi memisahkan tautan
  externalLinks yang site-nya mengandung "Crunchyroll" menjadi tombol
  utama; platform lain tetap chip. Animequ TIDAK PERNAH menanam sesi
  atau cookie akun streaming pengunjung: tautan selalu keluar ke situs
  platform, login terjadi di sana. Itu batas desain sejak Day 12.
- Situs live di https://anime.bintangyudhis.my.id (subdomain dipasang
  2 Nov 2026, vercel.app 307 redirect ke subdomain).
- Blok Muse Indonesia (2 Nov 2026 malam, permintaan Yudhis): kanal
  YouTube resmi @MuseIndonesia (Muse Communication, gratis + sub
  Indo). AniList externalLinks TIDAK memuat tautan Muse/YouTube per
  judul (cek sampel One Piece, Jujutsu Kaisen, Frieren, Solo
  Leveling: hanya Bilibili TV, Crunchyroll, Hulu, Netflix), jadi
  situs menautkan pencarian dalam kanal
  (youtube.com/@MuseIndonesia/search?query=<judul>) dan labelnya
  jujur sebagai pencarian. Jangan pernah mengarang URL episode.
- Arsitektur animequ ditegaskan lagi ke Yudhis malam itu: tidak ada
  database milik sendiri BY DESIGN. Server Vercel merender halaman
  dan mengambil data dari API AniList (database katalognya AniList),
  favorit + histori di localStorage pengunjung. Database (Supabase)
  baru perlu bila ada akun + sinkronisasi antar perangkat.
- Pagination katalog (2 Nov 2026 malam, keluhan Yudhis "kenapa hanya
  24"): genre dan pencarian kini memakai ambilHalaman (pageInfo
  AniList: total/currentPage/lastPage/hasNextPage), 50 judul per
  halaman, navigasi ?page= dengan komponen NavigasiHalaman bersama.
  Batas 24 sebelumnya adalah perPage halaman pertama saja. Total
  yang ditampilkan = angka pageInfo asli, dilarang mengarang.
  Peringkat /peringkat tetap Top 50 by design (itu chart, bukan
  jelajah katalog). Playlist Muse Indonesia: situs menautkan tab
  /playlists kanal + pencarian dalam kanal (hasilnya memuat
  playlist resmi judul bila ada); URL playlist per judul tidak
  tersedia dari API mana pun yang dipakai, jangan dikarang.
- Tautan LANGSUNG Muse Indonesia (2 Nov 2026 malam, permintaan
  Yudhis "harus mengarah ke videonya langsung"): lib/youtube.ts
  memakai YouTube Data API v3 resmi, pencarian dibatasi channelId
  UCxxnxya_32jcKj4yN1_kD7A (ID resmi @MuseIndonesia, diverifikasi
  dari canonical URL kanalnya). Prioritas hasil: playlist yang
  cocok, lalu video episode 1, lalu video pertama yang cocok
  (kecocokan = >=60% kata penting judul muncul di judul hasil).
  Kunci di env server YOUTUBE_API_KEY (Vercel), TIDAK di repo.
  Tanpa kunci / tidak ketemu: fallback pencarian dalam kanal.
  Cache fetch 24 jam menjaga kuota (10rb unit/hari bawaan Google).
- Pemutar embed di situs (2 Nov 2026 malam, permintaan Yudhis):
  temuan Muse kini juga membawa ID mentah; TautanResmi merender
  iframe youtube-nocookie (videoseries?list= untuk playlist,
  /embed/<id> untuk video), pola sama dengan TrailerAnime.
  Videonya tetap dari server YouTube, jadi tetap tanpa database.
  Batas yang harus diingat: pemilik kanal bisa mematikan embed per
  video dan lisensi wilayah tetap berlaku per penonton; tombol
  eksternal selalu dipertahankan sebagai cadangan.
- Pencocokan sadar format (2 Nov 2026 malam, laporan Yudhis): entri
  TV Slime sempat tertanam video spin-off "The Slime Diaries" dan
  OVA karena cakupan kata saja lolos untuk judul sempalan.
  lib/youtube.ts kini menyaring berlapis: channelId item diperiksa,
  gerbang format AniList (TV menolak OVA/ONA/movie/special, MOVIE
  wajib penanda movie, OVA wajib penanda OVA), gerbang musim
  (termasuk "Musim ke Dua"), dan uji inti judul terpadatkan dengan
  ekor sah terbatas. Prinsip: tidak ada tautan langsung lebih baik
  daripada tautan langsung yang salah judul.
- KUOTA API HABIS (2 Nov 2026 ~19:00): YouTube Data API memberi
  10.000 unit/hari dan search.list berharga 100 unit, jadi hanya
  100 pencarian per hari. Kuota hari pertama habis oleh gabungan
  pengujian + judul-judul baru yang dibuka (tiap judul baru sampai
  2 pencarian). Selama kuota habis, SEMUA judul jatuh ke tautan
  pencarian (bukan bug matcher). Reset tengah malam Pasifik
  (~15:00 WIB). Mitigasi permanen: cache fetch 7 hari, ejaan kedua
  hanya dicoba bila hasil ejaan pertama < 5 item. Judul hasil API
  datang ter-escape (&#39;) dan WAJIB didekode sebelum pencocokan.
- Cache pencarian Muse diperpanjang jadi 30 hari (revalidate
  2592000) atas pilihan Yudhis 2 Nov 2026 malam, demi irit kuota.
  Efek samping yang sudah disadari: hasil "tidak ditemukan" ikut
  tersimpan 30 hari, jadi judul yang baru masuk kanal bisa telat
  tampil. Perubahan nilai revalidate ikut mengganti kunci cache
  Next, sehingga deploy ini sekaligus memaksa pencarian segar
  setelah kuota pulih.
- Poster jebol karena kuota optimasi gambar Vercel (5 Nov 2026):
  plan gratis tim habis 2 Nov malam (5.000 transformasi), ukuran
  yang belum terolah menjawab 402, dan layar HP rapat piksel justru
  memilih ukuran itu. Perbaikan atas persetujuan Yudhis: images
  unoptimized true di next.config, poster dimuat langsung dari CDN
  AniList dan tidak tergantung kuota Vercel lagi.
- Pencocokan Muse diperketat lagi (5 Nov 2026, kasus crosscheck
  Demon Slayer): hasil berpenanda cuplikan/trailer/teaser/PV selalu
  ditolak, dan jalan terakhir cakupan kata diganti uji token ketat
  (semua kata patokan ada, nol kata asing di luar patokan + ekor
  sah) supaya nama arc musim lain tidak menumpang. Kedua ejaan
  kini selalu dicoba sampai ada temuan, karena saringan ketat
  membuat ejaan pertama lebih sering kosong; biaya aman oleh
  cache 30 hari per query. Uji luring 12 kasus lolos semua,
  termasuk kasus baik Spy x Family, Frieren, Mushoku, Slime OVA
  yang tidak boleh ikut gugur.
- Slime TV akhirnya ketemu (5 Nov 2026, laporan Yudhis "kan ada di
  Muse"): kanal menamai seri ini dengan judul Indonesia
  "(Tensura) Bereinkarnasi Malah Menjadi Slime", nol irisan kata
  dengan judul AniList, jadi semua hasil gugur di cakupan kata.
  Diagnosis memakai data API asli: 16 item hasil pencarian diperiksa
  satu per satu. Perbaikan: sinonim AniList (field synonyms kini
  diambil di query detail) menjadi jangkar identitas bila cakupan
  kata rendah, dengan syarat sinonim khas (terpadatkan minimal 5
  huruf) muncul di judul hasil dan semua gerbang lain lolos.
  Ditambah gerbang nomor episode: penomoran kanal berlanjut antar
  musim, jadi nomor episode di atas jumlah episode entri ini pasti
  musim lain (kasus Slime: episode 76 sampai 96 untuk entri 24
  episode). Uji luring: 16 item asli Slime terklasifikasi semua
  sesuai harapan (kompilasi musim 1 dan Episode 01 lolos; Diaries,
  OAD, movie, musim 2 dan 3, episode besar gugur) dan 12 kasus lama
  tidak berubah.
