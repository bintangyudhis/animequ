// Daftar platform streaming resmi dari externalLinks AniList
// (type STREAMING). Bila judul ini punya tautan Crunchyroll, tautan
// itu diangkat jadi tombol utama "Nonton di Crunchyroll"; platform
// lain tetap tampil sebagai chip di bawahnya. Bila tidak ada tautan
// streaming sama sekali, bagian ini tidak dirender — situs tidak
// mengarang tautan nonton. Semua tautan membuka situs platform
// masing-masing: login dan langganan diatur platform itu sendiri,
// Animequ tidak menyimpan sesi atau akun pengunjung.
export default function TautanResmi({
  tautan,
}: {
  tautan: { url: string | null; site: string | null; type: string | null }[] | null;
}) {
  const streaming = (tautan ?? []).filter(
    (item) => item.type === "STREAMING" && item.url && item.site,
  );
  if (streaming.length === 0) return null;
  const crunchyroll = streaming.filter((item) =>
    (item.site ?? "").toLowerCase().includes("crunchyroll"),
  );
  const lainnya = streaming.filter(
    (item) => !(item.site ?? "").toLowerCase().includes("crunchyroll"),
  );
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-line pb-2 text-xl font-black tracking-tight">
        Tonton di platform resmi
      </h2>
      {crunchyroll.length > 0 ? (
        <div className="flex flex-col gap-2">
          {crunchyroll.map((item) => (
            <a
              key={item.url}
              href={item.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-fit bg-accent px-6 py-3 text-sm font-black tracking-wide text-white transition-opacity hover:opacity-85"
            >
              Nonton di Crunchyroll ↗
            </a>
          ))}
          <p className="text-xs leading-relaxed text-muted">
            Tombol membuka halaman resmi judul ini di Crunchyroll. Kalau
            kamu sudah login Crunchyroll di browser ini, kamu langsung
            masuk sebagai akunmu sendiri.
          </p>
        </div>
      ) : null}
      {lainnya.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {lainnya.map((item) => (
            <li key={item.url}>
              <a
                href={item.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-line bg-panel px-4 py-2 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
              >
                {item.site} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-xs leading-relaxed text-muted">
        Tautan di atas berasal dari data AniList untuk judul ini dan
        dibuka di situs platform masing-masing.
      </p>
    </section>
  );
}
