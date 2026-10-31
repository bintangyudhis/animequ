import Image from "next/image";
import type { JadwalTayang } from "../../lib/anilist";
import { jamWib } from "../../lib/jadwal";

// Satu baris jadwal: jam WIB, poster kecil, judul, episode yang akan
// tayang, dan skor. Seluruh baris menaut ke halaman detail lokal.
export default function BarisJadwal({ tayang }: { tayang: JadwalTayang }) {
  const media = tayang.media;
  const judul = media.title.romaji ?? media.title.english ?? "Judul belum tersedia";
  const poster = media.coverImage.large;
  const genres = media.genres ?? [];
  return (
    <a
      href={`/anime/${media.id}`}
      className="group flex items-center gap-4 border border-line bg-panel px-3 py-3 transition-colors hover:border-accent sm:px-4"
    >
      <span className="w-12 shrink-0 font-mono text-sm font-bold text-accent">
        {jamWib(tayang.airingAt)}
      </span>
      <span className="relative block aspect-[3/4] w-10 shrink-0 overflow-hidden bg-paper">
        {poster ? (
          <Image
            src={poster}
            alt={judul}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold group-hover:text-accent">
          {judul}
        </span>
        <span className="block text-xs text-muted">
          Episode {tayang.episode}
          {genres.length > 0 ? ` · ${genres.slice(0, 2).join(" · ")}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold">
        ★ {media.averageScore === null ? "—" : (media.averageScore / 10).toFixed(1)}
      </span>
    </a>
  );
}
