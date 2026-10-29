import { daftarTrending } from "../lib/anilist";
import DaftarTren from "./DaftarTren";
import JudulSeksi from "./JudulSeksi";
import PesanGagal from "./PesanGagal";

export default async function BagianTrending() {
  const daftar = await daftarTrending();
  return (
    <section className="flex flex-col gap-5">
      <JudulSeksi
        id="trending"
        judul="Trending"
        keterangan="Sepuluh judul yang paling banyak dibicarakan di AniList saat ini."
      />
      {daftar === null ? (
        <PesanGagal seksi="anime trending" />
      ) : (
        <DaftarTren daftar={daftar} />
      )}
    </section>
  );
}
