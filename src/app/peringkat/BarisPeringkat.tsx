import Image from "next/image";
import type { AnimeRingkas } from "../../lib/anilist";
import { judulTampil, skorTampil } from "../../lib/anilist";
import { episodeTampil } from "../../lib/musim";

// Satu baris chart: nomor peringkat besar di kiri, poster kecil,
// judul + meta, skor di kanan. Berbeda dari grid kartu beranda supaya
// chart terbaca sebagai daftar peringkat, bukan katalog.
export default function BarisPeringkat({
  anime,
  peringkat,
}: {
  anime: AnimeRingkas;
  peringkat: number;
}) {
  const judul = judulTampil(anime);
  const poster = anime.coverImage.large;
  const genres = anime.genres ?? [];
  return (
    <a
      href={`/anime/${anime.id}`}
      className="group flex items-center gap-4 border border-line bg-panel px-3 py-3 transition-colors hover:border-accent sm:px-4"
    >
      <span className="w-10 shrink-0 text-center font-mono text-xl font-black text-accent">
        {peringkat}
      </span>
      <span className="relative block aspect-[3/4] w-12 shrink-0 overflow-hidden bg-paper">
        {poster ? (
          <Image
            src={poster}
            alt={judul}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold group-hover:text-accent">
          {judul}
        </span>
        <span className="block text-xs text-muted">
          {episodeTampil(anime)}
          {genres.length > 0 ? ` · ${genres.slice(0, 3).join(" · ")}` : ""}
          {anime.seasonYear ? ` · ${anime.seasonYear}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold">★ {skorTampil(anime)}</span>
    </a>
  );
}
