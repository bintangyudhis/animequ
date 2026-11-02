import { cariAnime } from "../../lib/anilist";
import KartuAnime from "../KartuAnime";
import NavigasiHalaman from "../NavigasiHalaman";
import PesanGagal from "../PesanGagal";

// Hasil pencarian sebagai komponen server async, kini berhalaman:
// 50 judul per halaman dan semua hasil yang cocok di AniList bisa
// dijelajahi lewat ?page=. Gagal fetch menampilkan pesan jujur,
// hasil kosong menampilkan pesan kosong, bukan grid kosong.
export default async function HasilPencarian({
  kataKunci,
  halaman,
}: {
  kataKunci: string;
  halaman: number;
}) {
  const hasil = await cariAnime(kataKunci, halaman);
  if (hasil === null) {
    return <PesanGagal seksi={`hasil pencarian "${kataKunci}"`} />;
  }
  if (hasil.daftar.length === 0) {
    return (
      <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        {halaman > 1
          ? `Halaman ${halaman} kosong: pencarian "${kataKunci}" hanya punya ${hasil.halamanTerakhir} halaman.`
          : `Tidak ada judul yang cocok dengan "${kataKunci}". Coba kata kunci lain, mis. judul bahasa Inggris atau romaji-nya.`}
      </p>
    );
  }
  return (
    <div>
      <p className="mb-5 text-sm font-bold">
        {hasil.total.toLocaleString("id-ID")} judul ditemukan untuk
        “{kataKunci}”
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {hasil.daftar.map((anime) => (
          <KartuAnime key={anime.id} anime={anime} />
        ))}
      </div>
      <NavigasiHalaman
        halaman={hasil.halaman}
        halamanTerakhir={hasil.halamanTerakhir}
        polaHref={`/cari?q=${encodeURIComponent(kataKunci)}&page=`}
      />
    </div>
  );
}
