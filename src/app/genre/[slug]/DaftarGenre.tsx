import { daftarPerGenre } from "../../../lib/anilist";
import KartuAnime from "../../KartuAnime";
import NavigasiHalaman from "../../NavigasiHalaman";
import PesanGagal from "../../PesanGagal";

// Grid judul satu genre sebagai komponen server async, kini
// berhalaman: 50 judul per halaman dan seluruh katalog genre di
// AniList bisa dijelajahi sampai halaman terakhir lewat ?page=.
// Total judul adalah angka asli pageInfo AniList. Gagal fetch
// menampilkan pesan jujur, hasil kosong menampilkan pesan kosong.
export default async function DaftarGenre({
  genre,
  slug,
  halaman,
}: {
  genre: string;
  slug: string;
  halaman: number;
}) {
  const hasil = await daftarPerGenre(genre, halaman);
  if (hasil === null) {
    return <PesanGagal seksi={`daftar genre ${genre}`} />;
  }
  if (hasil.daftar.length === 0) {
    return (
      <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        {halaman > 1
          ? `Halaman ${halaman} kosong: genre ${genre} hanya punya ${hasil.halamanTerakhir} halaman.`
          : `Belum ada judul yang terdaftar untuk genre ${genre} di AniList.`}
      </p>
    );
  }
  return (
    <div>
      <p className="mb-5 text-sm font-bold">
        {hasil.total.toLocaleString("id-ID")} judul bergenre {genre} di
        AniList, diurutkan dari yang terpopuler
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {hasil.daftar.map((anime) => (
          <KartuAnime key={anime.id} anime={anime} />
        ))}
      </div>
      <NavigasiHalaman
        halaman={hasil.halaman}
        halamanTerakhir={hasil.halamanTerakhir}
        polaHref={`/genre/${slug}?page=`}
      />
    </div>
  );
}
