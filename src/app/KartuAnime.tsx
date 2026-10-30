import Image from "next/image";
import type { AnimeRingkas } from "../lib/anilist";
import { judulTampil, skorTampil } from "../lib/anilist";
import { episodeTampil } from "../lib/musim";

// Kartu poster: poster di atas, judul + meta di bawah. Tautan ke halaman
// detail lokal judul itu (Day 12); tautan keluar ke AniList pindah ke
// halaman detail.
export default function KartuAnime({ anime }: { anime: AnimeRingkas }) {
  const poster = anime.coverImage.large;
  return (
    <a
      href={`/anime/${anime.id}`}
      className="group block border border-line bg-panel transition-colors hover:border-accent"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-panel">
        {poster ? (
          <Image
            src={poster}
            alt={judulTampil(anime)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
            Poster belum tersedia
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 min-h-10 text-sm leading-snug font-bold group-hover:text-accent">
          {judulTampil(anime)}
        </p>
        <p className="font-mono text-xs text-muted">{episodeTampil(anime)}</p>
        <p className="text-sm font-bold">
          ★ {skorTampil(anime)}
          <span className="ml-2 text-xs font-normal text-muted">
            {(anime.genres ?? []).slice(0, 2).join(" · ")}
          </span>
        </p>
      </div>
    </a>
  );
}
