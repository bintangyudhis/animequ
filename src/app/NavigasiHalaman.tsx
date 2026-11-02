import Link from "next/link";

// Navigasi halaman untuk daftar berhalaman (genre dan pencarian):
// tombol Sebelumnya/Berikutnya + jendela nomor halaman di sekitar
// halaman aktif, selalu menyertakan halaman pertama dan terakhir.
// polaHref adalah awalan URL yang tinggal ditambah nomor halaman,
// mis. "/genre/action?page=" atau "/cari?q=naruto&page=".
export default function NavigasiHalaman({
  halaman,
  halamanTerakhir,
  polaHref,
}: {
  halaman: number;
  halamanTerakhir: number;
  polaHref: string;
}) {
  if (halamanTerakhir <= 1) return null;

  const kandidat = new Set<number>([
    1,
    halamanTerakhir,
    halaman - 2,
    halaman - 1,
    halaman,
    halaman + 1,
    halaman + 2,
  ]);
  const nomor = [...kandidat]
    .filter((n) => n >= 1 && n <= halamanTerakhir)
    .sort((a, b) => a - b);

  const kelasTombol =
    "border border-line bg-panel px-4 py-2 text-sm font-bold transition-colors hover:border-accent hover:text-accent";
  const kelasNonaktif =
    "border border-line px-4 py-2 text-sm font-bold text-muted opacity-50";

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-8 flex flex-col items-center gap-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {halaman > 1 ? (
          <Link href={`${polaHref}${halaman - 1}`} className={kelasTombol}>
            ← Sebelumnya
          </Link>
        ) : (
          <span className={kelasNonaktif}>← Sebelumnya</span>
        )}
        {nomor.map((n, i) => (
          <span key={n} className="flex items-center gap-2">
            {i > 0 && nomor[i - 1] < n - 1 ? (
              <span className="text-muted">…</span>
            ) : null}
            {n === halaman ? (
              <span
                aria-current="page"
                className="border border-accent px-3 py-2 text-sm font-black text-accent"
              >
                {n}
              </span>
            ) : (
              <Link
                href={`${polaHref}${n}`}
                className="border border-line bg-panel px-3 py-2 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
              >
                {n}
              </Link>
            )}
          </span>
        ))}
        {halaman < halamanTerakhir ? (
          <Link href={`${polaHref}${halaman + 1}`} className={kelasTombol}>
            Berikutnya →
          </Link>
        ) : (
          <span className={kelasNonaktif}>Berikutnya →</span>
        )}
      </div>
      <p className="text-xs text-muted">
        Halaman {halaman} dari {halamanTerakhir}
      </p>
    </nav>
  );
}
