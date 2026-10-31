import { labelHariWib } from "../../lib/jadwal";

// Daftar lompatan ke tiap hari di halaman jadwal: satu klik membawa ke
// seksi hari itu (id seksi = kunci hari). Hanya tampil bila ada hari.
export default function DaftarHari({ kunciHari }: { kunciHari: string[] }) {
  if (kunciHari.length === 0) return null;
  return (
    <nav aria-label="Lompat ke hari" className="flex flex-wrap gap-2">
      {kunciHari.map((kunci) => (
        <a
          key={kunci}
          href={`#hari-${kunci}`}
          className="border border-line bg-panel px-3 py-1 text-xs font-bold transition-colors hover:border-accent hover:text-accent"
        >
          {labelHariWib(kunci)}
        </a>
      ))}
    </nav>
  );
}
