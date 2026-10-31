import Link from "next/link";

const PINTASAN = [
  {
    href: "/jadwal",
    judul: "Jadwal rilis",
    keterangan: "Episode yang tayang 7 hari ke depan, per hari WIB.",
  },
  {
    href: "/peringkat",
    judul: "Top anime",
    keterangan: "50 judul dengan skor tertinggi di AniList.",
  },
  {
    href: "/histori",
    judul: "Histori saya",
    keterangan: "Judul yang pernah kamu buka, tersimpan di browser ini.",
  },
];

// Pintasan di bawah beranda ke halaman baru Day 13, supaya pengunjung
// menemukan jadwal, chart, dan histori tanpa lewat bilah atas saja.
export default function PintasanJelajah() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-black tracking-tight">Jelajahi lebih jauh</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {PINTASAN.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group block border border-line bg-panel p-4 transition-colors hover:border-accent"
            >
              <span className="block text-sm font-bold group-hover:text-accent">
                {item.judul} →
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {item.keterangan}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
