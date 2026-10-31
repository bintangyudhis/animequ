import Link from "next/link";

const TAUTAN = [
  { href: "/#sedang-tayang", label: "Sedang Tayang" },
  { href: "/#trending", label: "Trending" },
  { href: "/#musim-ini", label: "Musim Ini" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/peringkat", label: "Top" },
  { href: "/favorit", label: "Favorit" },
  { href: "/histori", label: "Histori" },
];

// Bilah atas: wordmark, tautan seksi beranda (pakai path "/" supaya tetap
// jalan dari halaman lain), kolom cari (GET ke /cari), dan halaman favorit.
export default function BilahAtas() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-xl font-black tracking-tight uppercase"
        >
          Anime<span className="text-accent">qu</span>
        </Link>
        <form
          action="/cari"
          method="get"
          role="search"
          className="order-3 flex w-full min-w-0 sm:order-none sm:w-auto sm:flex-1 sm:justify-center"
        >
          <label className="sr-only" htmlFor="cari-bilah">
            Cari anime
          </label>
          <input
            id="cari-bilah"
            name="q"
            type="search"
            placeholder="Cari anime…"
            className="w-full max-w-xs border border-line bg-panel px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </form>
        <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
          {TAUTAN.map((tautan) => (
            <Link
              key={tautan.href}
              href={tautan.href}
              className="text-muted transition-colors hover:text-ink"
            >
              {tautan.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
