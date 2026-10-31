"use client";

import { useEffect } from "react";
import { catatKunjungan } from "../../../lib/histori";

// Komponen tanpa tampilan: setiap halaman detail yang dirender
// mencatat kunjungan ke histori lokal. Dicatat di useEffect supaya
// pencatatan tidak terjadi saat render server dan tidak memengaruhi
// markup halaman.
export default function PencatatHistori({
  id,
  judul,
  poster,
}: {
  id: number;
  judul: string;
  poster: string | null;
}) {
  useEffect(() => {
    catatKunjungan({ id, judul, poster });
  }, [id, judul, poster]);
  return null;
}
