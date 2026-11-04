import { cariDiMuseIndonesia } from "../../../lib/youtube";

// Bagian nonton resmi di halaman detail, tiga lapis:
// 1. Crunchyroll: bila externalLinks AniList (type STREAMING) memuat
//    tautan Crunchyroll untuk judul ini, tautan itu diangkat jadi
//    tombol utama.
// 2. Muse Indonesia: kanal YouTube resmi pemegang lisensi yang
//    menayangkan anime gratis ber-subtitle Indonesia. Server mencari
//    video/playlist judul ini langsung di kanal itu lewat YouTube
//    Data API (lib/youtube.ts): ketemu, tombolnya mengarah LANGSUNG
//    ke video episode 1 atau playlist resminya; tidak ketemu (atau
//    kunci API belum dipasang), jatuh ke tautan pencarian di dalam
//    kanalnya (@MuseIndonesia/search). Yang ditautkan selalu hasil
//    pencarian API di kanal resmi itu, bukan URL karangan.
// 3. Platform streaming resmi lain dari AniList sebagai chip.
// Semua tautan membuka situs platform masing-masing: login dan
// langganan diatur platform itu sendiri, Animequ tidak menyimpan
// sesi atau akun pengunjung.
export default async function TautanResmi({
  tautan,
  judul,
  judulInggris,
  format,
  sinonim,
  jumlahEpisode,
}: {
  tautan: { url: string | null; site: string | null; type: string | null }[] | null;
  judul: string;
  judulInggris: string | null;
  format: string | null;
  sinonim: string[] | null;
  jumlahEpisode: number | null;
}) {
  const temuanMuse = await cariDiMuseIndonesia(
    judul,
    judulInggris,
    format,
    sinonim ?? [],
    jumlahEpisode,
  );
  const streaming = (tautan ?? []).filter(
    (item) => item.type === "STREAMING" && item.url && item.site,
  );
  const crunchyroll = streaming.filter((item) =>
    (item.site ?? "").toLowerCase().includes("crunchyroll"),
  );
  const lainnya = streaming.filter(
    (item) => !(item.site ?? "").toLowerCase().includes("crunchyroll"),
  );
  const cariMuse = `https://www.youtube.com/@MuseIndonesia/search?query=${encodeURIComponent(judul)}`;
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
      <div className="flex flex-col gap-2 border border-line bg-panel p-4">
        <p className="text-sm leading-relaxed">
          <span className="font-bold">Gratis di YouTube:</span> kanal
          Muse Indonesia menayangkan anime berlisensi resmi dengan
          subtitle Indonesia, gratis tanpa langganan.
        </p>
        {temuanMuse ? (
          <div className="flex flex-col gap-2">
            <div className="aspect-video w-full border border-line bg-black">
              <iframe
                src={
                  temuanMuse.jenis === "playlist"
                    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${temuanMuse.id}`
                    : `https://www.youtube-nocookie.com/embed/${temuanMuse.id}`
                }
                title={temuanMuse.judulHasil}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted">
              {temuanMuse.judulHasil} — diputar di sini lewat pemutar
              resmi YouTube dari kanal Muse Indonesia, tanpa pindah
              situs. Bila pemutar menampilkan pesan pembatasan dari
              YouTube (sebagian video memang dibatasi pemiliknya),
              pakai tombol buka di YouTube di bawah.
            </p>
            <a
              href={temuanMuse.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-fit bg-accent px-5 py-2.5 text-sm font-black text-white transition-opacity hover:opacity-85"
            >
              {temuanMuse.jenis === "playlist"
                ? "Nonton playlist resminya di YouTube ↗"
                : "Nonton langsung di YouTube ↗"}
            </a>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <a
            href={cariMuse}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-fit border border-accent px-5 py-2.5 text-sm font-black text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Cari judul ini di Muse Indonesia ↗
          </a>
          <a
            href="https://www.youtube.com/@MuseIndonesia"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-fit border border-line px-5 py-2.5 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
          >
            Buka kanalnya ↗
          </a>
          <a
            href="https://www.youtube.com/@MuseIndonesia/playlists"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-fit border border-line px-5 py-2.5 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
          >
            Semua playlist resminya ↗
          </a>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Kanal ini mengelompokkan tiap judul jadi playlist episode di
          tab Playlist. Hasil pencarian di dalam kanal juga menampilkan
          playlist resmi judul itu bila ada.
        </p>
        <p className="text-xs leading-relaxed text-muted">
          Tombol pertama membuka pencarian judul ini di dalam kanal
          Muse Indonesia. Tidak semua judul ada di sana, tergantung
          lisensi tiap judul.
        </p>
      </div>
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
      {streaming.length > 0 ? (
        <p className="text-xs leading-relaxed text-muted">
          Tautan Crunchyroll dan platform lain di atas berasal dari
          data AniList untuk judul ini dan dibuka di situs platform
          masing-masing.
        </p>
      ) : null}
    </section>
  );
}
