// Daftar platform streaming resmi dari externalLinks AniList
// (type STREAMING). Bila tidak ada, bagian ini tidak dirender — situs
// tidak mengarang tautan nonton.
export default function TautanResmi({
  tautan,
}: {
  tautan: { url: string | null; site: string | null; type: string | null }[] | null;
}) {
  const streaming = (tautan ?? []).filter(
    (item) => item.type === "STREAMING" && item.url && item.site,
  );
  if (streaming.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-black tracking-tight">
        Tonton di platform resmi
      </h2>
      <ul className="flex flex-wrap gap-2">
        {streaming.map((item) => (
          <li key={item.url}>
            <a
              href={item.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="block border border-line bg-panel px-4 py-2 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
            >
              {item.site}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-muted">
        Tautan di atas berasal dari data AniList untuk judul ini dan dibuka
        di situs platform masing-masing.
      </p>
    </section>
  );
}
