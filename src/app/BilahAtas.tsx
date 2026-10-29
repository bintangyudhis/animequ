import Link from "next/link";

const TAUTAN = [
  { href: "#sedang-tayang", label: "Sedang Tayang" },
  { href: "#trending", label: "Trending" },
  { href: "#musim-ini", label: "Musim Ini" },
];

export default function BilahAtas() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-xl font-black tracking-tight uppercase"
        >
          Anime<span className="text-accent">qu</span>
        </Link>
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
