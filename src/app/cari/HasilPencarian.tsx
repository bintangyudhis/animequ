import { cariAnime } from "../../lib/anilist";
import KartuAnime from "../KartuAnime";
import PesanGagal from "../PesanGagal";

// Hasil pencarian sebagai komponen server async: gagal fetch AniList
// menampilkan pesan jujur, hasil kosong menampilkan pesan kosong —
// bukan grid kosong tanpa penjelasan.
export default async function HasilPencarian({
  kataKunci,
}: {
  kataKunci: string;
}) {
  const daftar = await cariAnime(kataKunci);
  if (daftar === null) {
    return <PesanGagal seksi={`hasil pencarian "${kataKunci}"`} />;
  }
  if (daftar.length === 0) {
    return (
      <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        Tidak ada judul yang cocok dengan “{kataKunci}”. Coba kata kunci
        lain, mis. judul bahasa Inggris atau romaji-nya.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-5 font-mono text-sm text-muted">
        {daftar.length} judul ditemukan
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {daftar.map((anime) => (
          <KartuAnime key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
}
