import Image from "next/image";
import type { AnimeRingkas } from "../lib/anilist";
import { judulTampil, skorTampil } from "../lib/anilist";

// Daftar peringkat: nomor besar di kiri, poster kecil, judul + genre.
// Beda bentuk dari grid kartu supaya halaman tidak terasa satu template.
export default function DaftarTren({ daftar }: { daftar: AnimeRingkas[] }) {
  return (
    <ol className="flex flex-col divide-y divide-line border-y border-line">
      {daftar.map((anime, indeks) => {
        const poster = anime.coverImage.large;
        return (
          <li key={anime.id}>
            <a
              href={anime.siteUrl ?? "#"}
              target={anime.siteUrl ? "_blank" : undefined}
              rel={anime.siteUrl ? "noreferrer" : undefined}
              className="group flex items-center gap-4 py-3 transition-colors hover:bg-panel sm:gap-6"
            >
              <span className="w-10 shrink-0 text-right text-2xl font-black text-muted group-hover:text-accent sm:text-3xl">
                {String(indeks + 1).padStart(2, "0")}
              </span>
              <span className="relative block h-16 w-12 shrink-0 overflow-hidden bg-panel">
                {poster ? (
                  <Image
                    src={poster}
                    alt={judulTampil(anime)}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold group-hover:text-accent">
                  {judulTampil(anime)}
                </span>
                <span className="block truncate text-sm text-muted">
                  {(anime.genres ?? []).slice(0, 3).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold">
                ★ {skorTampil(anime)}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
