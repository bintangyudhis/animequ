import { daftarTop } from "../../lib/anilist";
import PesanGagal from "../PesanGagal";
import BarisPeringkat from "./BarisPeringkat";

// Chart top anime: 50 judul dengan skor rata-rata tertinggi di AniList.
// Daftar di-cache 30 menit seperti daftar lain, jadi peringkat tidak
// berubah di tiap refresh tetapi tetap segar.
export default async function Peringkat() {
  const daftar = await daftarTop();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Top anime
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          50 judul dengan skor rata-rata tertinggi di AniList. Skor adalah
          rata-rata dari komunitas AniList (skala 10), bukan penilaian
          Animequ.
        </p>
      </div>
      {daftar === null ? (
        <PesanGagal seksi="chart top anime" />
      ) : (
        <ol className="flex flex-col gap-2">
          {daftar.map((anime, index) => (
            <li key={anime.id}>
              <BarisPeringkat anime={anime} peringkat={index + 1} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
