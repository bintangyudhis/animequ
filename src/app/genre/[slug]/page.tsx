import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DAFTAR_GENRE, genreDariSlug } from "../../../lib/genre";
import DaftarGenre from "./DaftarGenre";

// Halaman satu genre: /genre/<slug>. Slug di luar peta genre resmi
// menampilkan halaman 404 lewat notFound(), sama seperti id detail
// yang tidak dikenal (config dynamicParams tidak kompatibel dengan
// cacheComponents Next 16, jadi pola ini yang dipakai di seluruh
// situs). Grid judul dirender di dalam Suspense supaya cangkang
// halaman tidak menunggu fetch AniList.
export default async function HalamanGenre({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { slug } = await params;
  const genre = genreDariSlug(slug);
  if (!genre) notFound();
  const mentahPage = (await searchParams).page;
  const nomorPage = Number(Array.isArray(mentahPage) ? mentahPage[0] : mentahPage);
  const halaman = Number.isInteger(nomorPage) && nomorPage > 0 ? nomorPage : 1;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Anime {genre.nama}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Judul terpopuler bergenre {genre.nama} menurut AniList, dari
          semua musim dan tahun.
        </p>
      </div>
      <nav aria-label="Pindah genre" className="flex flex-wrap gap-2">
        {DAFTAR_GENRE.map((item) => (
          <Link
            key={item.slug}
            href={`/genre/${item.slug}`}
            aria-current={item.slug === genre.slug ? "page" : undefined}
            className={
              item.slug === genre.slug
                ? "border border-accent bg-panel px-3 py-1 text-xs font-bold text-accent"
                : "border border-line bg-panel px-3 py-1 text-xs font-bold transition-colors hover:border-accent hover:text-accent"
            }
          >
            {item.nama}
          </Link>
        ))}
      </nav>
      <Suspense
        key={halaman}
        fallback={
          <p className="text-sm text-muted">
            Memuat judul genre {genre.nama} dari AniList…
          </p>
        }
      >
        <DaftarGenre genre={genre.nama} slug={genre.slug} halaman={halaman} />
      </Suspense>
    </div>
  );
}
