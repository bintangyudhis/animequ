import { daftarPerGenre } from "../../../lib/anilist";
import KartuAnime from "../../KartuAnime";
import PesanGagal from "../../PesanGagal";

// Grid judul satu genre sebagai komponen server async: gagal fetch
// AniList menampilkan pesan jujur, hasil kosong menampilkan pesan
// kosong, bukan grid kosong tanpa penjelasan.
export default async function DaftarGenre({ genre }: { genre: string }) {
  const daftar = await daftarPerGenre(genre);
  if (daftar === null) {
    return <PesanGagal seksi={`daftar genre ${genre}`} />;
  }
  if (daftar.length === 0) {
    return (
      <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        Belum ada judul yang terdaftar untuk genre {genre} di AniList.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-5 text-sm font-bold">
        {daftar.length} judul terpopuler di genre ini
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {daftar.map((anime) => (
          <KartuAnime key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
}
