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
