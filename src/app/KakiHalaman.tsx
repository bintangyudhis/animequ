export default function KakiHalaman() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6">
        <p className="text-lg font-extrabold tracking-tight">
          Animequ — cari tontonan berikutnya, lalu tonton di tempat resmi.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Data anime (judul, poster, skor, jadwal) diambil dari AniList, API
          GraphQL gratis tanpa kunci. Situs ini tidak menyimpan atau
          memutar video apa pun: yang tersedia di sini hanya informasi,
          trailer, dan tautan ke platform streaming resmi.
        </p>
        <nav
          aria-label="Tautan situs"
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold"
        >
          <a href="/cari" className="hover:text-accent">
            Cari
          </a>
          <a href="/jadwal" className="hover:text-accent">
            Jadwal
          </a>
          <a href="/peringkat" className="hover:text-accent">
            Top anime
          </a>
          <a href="/favorit" className="hover:text-accent">
            Favorit
          </a>
          <a href="/histori" className="hover:text-accent">
            Histori
          </a>
        </nav>
        <p className="font-mono text-xs text-muted">
          Sumber data: graphql.anilist.co
        </p>
      </div>
    </footer>
  );
}
