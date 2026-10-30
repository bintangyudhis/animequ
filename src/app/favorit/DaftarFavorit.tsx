"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bacaFavorit, simpanFavorit, type AnimeFavorit } from "../../lib/favorit";

// Daftar favorit dibaca dari localStorage setelah mount dan diperbarui
// saat event animequ:favorit (mis. tombol di halaman detail ditekan di
// tab yang sama) maupun saat item dihapus dari daftar ini.
export default function DaftarFavorit() {
  const [daftar, setDaftar] = useState<AnimeFavorit[] | null>(null);

  useEffect(() => {
    const muat = () => setDaftar(bacaFavorit());
    muat();
    window.addEventListener("animequ:favorit", muat);
    return () => window.removeEventListener("animequ:favorit", muat);
  }, []);

  if (daftar === null) {
    return <p className="text-sm text-muted">Memuat favorit…</p>;
  }
  if (daftar.length === 0) {
    return (
      <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        Belum ada favorit. Buka halaman detail sebuah anime, lalu tekan
        “Simpan ke favorit” — daftar ini tersimpan di browser ini saja.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {daftar.map((item) => (
        <li
          key={item.id}
          className="group border border-line bg-panel transition-colors hover:border-accent"
        >
          <Link href={`/anime/${item.id}`} className="block">
            <span className="relative block aspect-[3/4] w-full overflow-hidden bg-panel">
              {item.poster ? (
                <Image
                  src={item.poster}
                  alt={item.judul}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
                  Poster belum tersedia
                </span>
              )}
            </span>
            <span className="block truncate p-3 text-sm font-bold group-hover:text-accent">
              {item.judul}
            </span>
          </Link>
          <button
            type="button"
            onClick={() =>
              simpanFavorit(daftar.filter((favorit) => favorit.id !== item.id))
            }
            className="w-full border-t border-line px-3 py-2 text-left text-xs font-bold text-muted transition-colors hover:text-accent"
          >
            Hapus dari favorit
          </button>
        </li>
      ))}
    </ul>
  );
}
