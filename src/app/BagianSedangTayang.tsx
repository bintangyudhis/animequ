import { daftarSedangTayang } from "../lib/anilist";
import JudulSeksi from "./JudulSeksi";
import KartuAnime from "./KartuAnime";
import PesanGagal from "./PesanGagal";

export default async function BagianSedangTayang() {
  const daftar = await daftarSedangTayang();
  return (
    <section className="flex flex-col gap-5">
      <JudulSeksi
        id="sedang-tayang"
        judul="Sedang Tayang"
        keterangan="Anime yang episodenya masih rilis minggu ini, diurutkan dari yang paling banyak diikuti."
      />
      {daftar === null ? (
        <PesanGagal seksi="anime yang sedang tayang" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {daftar.map((anime) => (
            <KartuAnime key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </section>
  );
}
