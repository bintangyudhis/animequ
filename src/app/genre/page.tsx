import Link from "next/link";
import { DAFTAR_GENRE } from "../../lib/genre";

// Indeks genre: semua genre resmi AniList sebagai pintu masuk ke
// halaman per genre. Tanpa angka jumlah judul, karena situs tidak
// mengarang statistik yang tidak diambil dari AniList.
export default function IndeksGenre() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Jelajahi per genre
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Pilih genre untuk melihat judul terpopuler di genre itu menurut
          AniList. Satu judul bisa muncul di beberapa genre sekaligus.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {DAFTAR_GENRE.map((genre) => (
          <li key={genre.slug}>
            <Link
              href={`/genre/${genre.slug}`}
              className="group block border border-line bg-panel p-5 transition-colors hover:border-accent"
            >
              <span className="block text-base font-bold group-hover:text-accent">
                {genre.nama} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
