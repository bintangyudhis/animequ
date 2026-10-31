"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  bacaHistori,
  simpanHistori,
  type AnimeHistori,
} from "../../lib/histori";

// Daftar histori dibaca dari localStorage setelah mount, seperti daftar
// favorit: tidak ada data histori yang menyentuh server. Tombol hapus
// tersedia per judul dan untuk seluruh daftar sekaligus.
export default function DaftarHistori() {
  const [daftar, setDaftar] = useState<AnimeHistori[] | null>(null);

  useEffect(() => {
    const muat = () => setDaftar(bacaHistori());
    muat();
    window.addEventListener("animequ:histori", muat);
    return () => window.removeEventListener("animequ:histori", muat);
  }, []);

  if (daftar === null) {
    return <p className="text-sm text-muted">Memuat histori…</p>;
  }
  if (daftar.length === 0) {
    return (
      <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
        Belum ada histori. Buka halaman detail sebuah anime, dan judul itu
        akan muncul di sini — terbaru di atas, maksimal 50 entri.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => simpanHistori([])}
          className="border border-line px-4 py-2 text-sm font-bold text-muted transition-colors hover:border-accent hover:text-accent"
        >
          Hapus semua histori
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {daftar.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-4 border border-line bg-panel px-3 py-3 sm:px-4"
          >
            <Link
              href={`/anime/${item.id}`}
              className="flex min-w-0 flex-1 items-center gap-4"
            >
              <span className="relative block aspect-[3/4] w-12 shrink-0 overflow-hidden bg-paper">
                {item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.judul}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold group-hover:text-accent">
                  {item.judul}
                </span>
                <span className="block text-xs text-muted">
                  Dibuka{" "}
                  {new Intl.DateTimeFormat("id-ID", {
                    timeZone: "Asia/Jakarta",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(item.dikunjungi))}{" "}
                  WIB
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() =>
                simpanHistori(daftar.filter((histori) => histori.id !== item.id))
              }
              className="shrink-0 px-2 py-1 text-xs font-bold text-muted transition-colors hover:text-accent"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
