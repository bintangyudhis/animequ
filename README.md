# Animequ

Website informasi anime yang datanya diambil dari AniList API (GraphQL,
gratis, tanpa API key). Pengunjung bisa melihat anime yang sedang tayang,
yang sedang tren, dan chart musim berjalan. Halaman detail, pencarian,
favorit, dan riwayat menyusul sesuai rencana harian.

Situs ini tidak menyediakan video bajakan: "nonton" di sini berarti
trailer dan tautan ke platform streaming resmi.

## Fitur (Day 11)

- Beranda: anime yang sedang tayang (status RELEASING, urut popularitas)
- Beranda: 10 anime trending dari AniList
- Beranda: chart musim berjalan (musim dihitung dari tanggal render)
- Kartu poster dengan skor, info episode berikutnya, dan genre
- Data di-cache 30 menit per daftar agar hemat kuota AniList

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

- Day 12: pencarian + halaman detail (sinopsis, genre, skor, studio,
  trailer, tautan platform resmi) + favorit (localStorage)
- Day 13: jadwal rilis mingguan + chart top anime + histori tontonan
  (localStorage)
- Day 14: polish UI + README final

## Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).
