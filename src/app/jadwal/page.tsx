import { connection } from "next/server";
import { daftarJadwal } from "../../lib/anilist";
import { kelompokkanPerHari, labelHariWib, rentangJadwal } from "../../lib/jadwal";
import PesanGagal from "../PesanGagal";
import BarisJadwal from "./BarisJadwal";
import DaftarHari from "./DaftarHari";

// Jadwal rilis 7 hari ke depan, dikelompokkan per hari WIB. Tanggal
// dihitung saat request (lihat BagianMusim): `await connection()`
// mencegah Next 16 menolak `new Date()` saat prerender.
export default async function Jadwal() {
  await connection();
  const { dariDetik, sampaiDetik } = rentangJadwal();
  const jadwal = await daftarJadwal(dariDetik, sampaiDetik);
  const perHari = jadwal === null ? [] : kelompokkanPerHari(jadwal);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Jadwal rilis minggu ini
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Episode anime yang akan tayang dalam 7 hari ke depan, diurutkan
          per hari. Jam ditampilkan dalam WIB (Asia/Jakarta).
        </p>
      </div>
      {jadwal === null ? (
        <PesanGagal seksi="jadwal rilis" />
      ) : perHari.length === 0 ? (
        <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
          Tidak ada episode yang terjadwal dalam 7 hari ke depan menurut
          AniList saat ini.
        </p>
      ) : (
        <>
          <DaftarHari kunciHari={perHari.map(({ kunci }) => kunci)} />
          {perHari.map(({ kunci, item }) => (
          <section
            key={kunci}
            id={`hari-${kunci}`}
            className="flex scroll-mt-20 flex-col gap-3"
          >
            <h2 className="border-b-2 border-accent pb-2 text-xl font-black tracking-tight">
              {labelHariWib(kunci)}
            </h2>
            <ul className="flex flex-col gap-2">
              {item.map((tayang) => (
                <li key={`${tayang.media.id}-${tayang.airingAt}`}>
                  <BarisJadwal tayang={tayang} />
                </li>
              ))}
            </ul>
          </section>
          ))}
        </>
      )}
    </div>
  );
}
