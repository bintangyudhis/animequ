# Animequ

Website informasi anime yang datanya diambil dari AniList API (GraphQL,
gratis, tanpa API key). Pengunjung bisa melihat anime yang sedang tayang,
yang sedang tren, dan chart musim berjalan, mencari judul, membuka halaman
detail, menyimpan favorit di browsernya sendiri, melihat jadwal rilis
mingguan dan chart top anime, dan menelusuri histori judul yang pernah
dibuka.

Situs ini tidak menyediakan video bajakan: "nonton" di sini berarti
trailer dan tautan ke platform streaming resmi.

## Fitur (Day 11–13)

- Beranda: anime yang sedang tayang (status RELEASING, urut popularitas)
- Beranda: 10 anime trending dari AniList
- Beranda: chart musim berjalan (musim dihitung dari tanggal render)
- Kartu poster dengan skor, info episode berikutnya, dan genre
- Data di-cache 30 menit per daftar agar hemat kuota AniList
- Pencarian (`/cari?q=...`, urut SEARCH_MATCH, hasil bisa dibagikan
  lewat URL) + kolom cari di bilah atas
- Halaman detail (`/anime/[id]`): sinopsis, genre, skor, format, status,
  studio, tahun mulai, trailer YouTube, tautan platform streaming resmi
  dari AniList, dan tautan AniList; ID tak dikenal → 404
- Favorit (localStorage, tanpa akun): tombol simpan di halaman detail +
  halaman `/favorit` dengan hapus per judul; kartu beranda dan daftar
  trending kini menaut ke detail lokal, bukan keluar ke AniList
- Jadwal rilis (`/jadwal`): episode yang tayang 7 hari ke depan dari
  AniList (AiringSchedule, urut waktu), dikelompokkan per hari WIB
  dengan lompatan antar hari
- Chart top anime (`/peringkat`): 50 judul dengan skor tertinggi
  (SCORE_DESC) sebagai daftar peringkat bernomor
- Histori tontonan (localStorage, tanpa akun): setiap halaman detail
  yang dibuka tercatat otomatis (terbaru di atas, maks 50 entri) +
  halaman `/histori` dengan hapus per judul dan hapus semua

## Teknologi

- Next.js 16 + Tailwind CSS v4 + React 19
- AniList GraphQL API (`https://graphql.anilist.co`), tanpa kunci
- Deploy: Vercel (region `sin1`); commit rutin memakai penanda
  `[skip-vercel]` supaya tidak memicu build, deploy harian lewat satu
  commit kosong `Day N: deploy`

## Menjalankan lokal

```bash
npm install
npm run dev
```

Tidak ada variabel environment yang wajib diisi: AniList tidak memakai
kunci. Build lokal:

```bash
npm run build
```

## Rencana berikutnya

- Day 14: polish UI + README final

## Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).
