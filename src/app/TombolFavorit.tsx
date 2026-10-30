"use client";

import { useEffect, useState } from "react";
import { isFavorit, toggleFavorit } from "../lib/favorit";

// Tombol simpan di halaman detail. Status awal dibaca dari localStorage
// setelah mount (bukan saat render server) supaya tidak ada perbedaan
// markup server/klien.
export default function TombolFavorit({
  id,
  judul,
  poster,
}: {
  id: number;
  judul: string;
  poster: string | null;
}) {
  const [tersimpan, setTersimpan] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setTersimpan(isFavorit(id));
    setSiap(true);
  }, [id]);

  return (
    <button
      type="button"
      disabled={!siap}
      aria-pressed={tersimpan}
      onClick={() => setTersimpan(toggleFavorit({ id, judul, poster }))}
      className="border border-accent px-5 py-3 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-paper disabled:opacity-50"
    >
      {tersimpan ? "★ Tersimpan di favorit" : "☆ Simpan ke favorit"}
    </button>
  );
}
