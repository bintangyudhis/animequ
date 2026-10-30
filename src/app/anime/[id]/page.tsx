import Image from "next/image";
import { notFound } from "next/navigation";
import { detailAnime, judulTampil, skorTampil } from "../../../lib/anilist";
import { labelFormat, labelStatus } from "../../../lib/labelDetail";
import { bersihkanDeskripsi } from "../../../lib/teks";
import { episodeTampil } from "../../../lib/musim";
import TombolFavorit from "../../TombolFavorit";
import TrailerAnime from "./TrailerAnime";
import TautanResmi from "./TautanResmi";

// Halaman detail: poster kiri + info kanan di layar lebar, menumpuk di HP.
// ID tak dikenal (detail null) diarahkan ke halaman 404 bawaan Next.
export default async function DetailAnime({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numerik = Number(id);
  if (!Number.isInteger(numerik)) notFound();
  const anime = await detailAnime(numerik);
  if (!anime) notFound();

  const judul = judulTampil(anime);
  const sinopsis = bersihkanDeskripsi(anime.description);
  const studio = (anime.studios?.nodes ?? [])
    .map((node) => node.name)
    .filter((nama): nama is string => Boolean(nama));
  const poster = anime.coverImage.large;
  const tahunMulai = anime.startDate?.year;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden border border-line bg-panel sm:w-64">
          {poster ? (
            <Image
              src={poster}
              alt={judul}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
              Poster belum tersedia
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-sm text-accent">
              ★ {skorTampil(anime)}
              <span className="ml-3 text-muted">{episodeTampil(anime)}</span>
            </p>
            <h1 className="text-3xl leading-tight font-black tracking-tight break-words sm:text-4xl">
              {judul}
            </h1>
            {anime.title.english && anime.title.english !== judul ? (
              <p className="text-sm text-muted">{anime.title.english}</p>
            ) : null}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-mono text-xs text-muted">Format</dt>
              <dd className="font-bold">{labelFormat(anime.format)}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted">Status</dt>
              <dd className="font-bold">{labelStatus(anime.status)}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted">Tahun mulai</dt>
              <dd className="font-bold">{tahunMulai ?? "—"}</dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="font-mono text-xs text-muted">Studio</dt>
              <dd className="font-bold">
                {studio.length > 0 ? studio.join(" · ") : "—"}
              </dd>
            </div>
          </dl>
          {(anime.genres ?? []).length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {(anime.genres ?? []).map((genre) => (
                <li
                  key={genre}
                  className="border border-line bg-panel px-3 py-1 text-xs font-bold"
                >
                  {genre}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <TombolFavorit id={anime.id} judul={judul} poster={poster} />
            {anime.siteUrl ? (
              <a
                href={anime.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="border border-line px-5 py-3 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
              >
                Lihat di AniList
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <section className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-xl font-black tracking-tight">Sinopsis</h2>
        <p className="text-base leading-relaxed text-muted">
          {sinopsis || "Sinopsis belum tersedia untuk judul ini."}
        </p>
      </section>
      <TrailerAnime trailer={anime.trailer} judul={judul} />
      <TautanResmi tautan={anime.externalLinks} />
    </div>
  );
}
