import { Suspense } from "react";
import FormulirPencarian from "./FormulirPencarian";
import HasilPencarian from "./HasilPencarian";

// Halaman /cari?q=... : tanpa kata kunci hanya menampilkan formulir dan
// ajakan; dengan kata kunci, hasil dirender di dalam Suspense supaya
// cangkang halaman tidak menunggu fetch AniList.
export default async function Cari({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const mentah = Array.isArray(params.q) ? params.q[0] : params.q;
  const kataKunci = (mentah ?? "").trim();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Cari anime
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Ketik judulnya — pencarian memakai data AniList dan hasilnya bisa
          dibagikan lewat tautan halaman ini.
        </p>
      </div>
      <FormulirPencarian nilaiAwal={kataKunci} />
      {kataKunci ? (
        <Suspense
          fallback={
            <p className="text-sm text-muted">
              Mencari “{kataKunci}” di AniList…
            </p>
          }
        >
          <HasilPencarian kataKunci={kataKunci} />
        </Suspense>
      ) : (
        <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
          Belum ada kata kunci. Ketik judul di atas, lalu tekan Cari.
        </p>
      )}
    </div>
  );
}
