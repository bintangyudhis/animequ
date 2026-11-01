// Embed trailer hanya bila AniList menyediakannya dari YouTube —
// satu-satunya sumber video di situs ini, bukan pemutar bajakan.
// Tanpa trailer, komponen tidak merender apa pun.
export default function TrailerAnime({
  trailer,
  judul,
}: {
  trailer: { id: string | null; site: string | null } | null;
  judul: string;
}) {
  if (!trailer || trailer.site !== "youtube" || !trailer.id) return null;
  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <h2 className="border-b border-line pb-2 text-xl font-black tracking-tight">
        Trailer
      </h2>
      <div className="aspect-video w-full border border-line bg-panel">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.id}`}
          title={`Trailer ${judul}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
