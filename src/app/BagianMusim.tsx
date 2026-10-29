import { connection } from "next/server";
import { daftarMusim } from "../lib/anilist";
import { labelMusim, musimBerjalan } from "../lib/musim";
import JudulSeksi from "./JudulSeksi";
import KartuAnime from "./KartuAnime";
import PesanGagal from "./PesanGagal";

export default async function BagianMusim() {
  // Musim dihitung dari tanggal saat request: akses dinamis ini membuat
  // seksi ini di-render per request (di dalam Suspense), bukan di-prerender
  // saat build — Next 16 menolak `new Date()` saat prerender.
  await connection();
  const { musim, tahun } = musimBerjalan();
  const daftar = await daftarMusim(musim, tahun);
  return (
    <section className="flex flex-col gap-5">
      <JudulSeksi
        id="musim-ini"
        judul={`Chart ${labelMusim(musim, tahun)}`}
        keterangan="Judul-judul musim berjalan, diurutkan dari yang paling banyak diikuti."
      />
      {daftar === null ? (
        <PesanGagal seksi="chart musim ini" />
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
