// Pengelompokan jadwal tayang per hari dalam zona waktu Asia/Jakarta
// (WIB): satu episode tayang masuk ke hari WIB saat ia mengudara, bukan
// hari UTC server. Rentang selalu 7 hari ke depan dari saat render.

import type { JadwalTayang } from "./anilist";

const NAMA_HARI = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export function rentangJadwal(tanggal = new Date()): {
  dariDetik: number;
  sampaiDetik: number;
} {
  const dariDetik = Math.floor(tanggal.getTime() / 1000);
  return { dariDetik, sampaiDetik: dariDetik + 7 * 24 * 3600 };
}

// Kunci hari "YYYY-MM-DD" dalam WIB, dipakai untuk mengelompokkan dan
// mengurutkan tanpa bergantung pada zona waktu server.
export function kunciHariWib(detik: number): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(detik * 1000));
}

export function labelHariWib(kunci: string): string {
  const [tahun, bulan, tanggal] = kunci.split("-").map(Number);
  // Tengah hari UTC agar tanggal tidak bergeser di zona waktu mana pun.
  const hari = new Date(Date.UTC(tahun, bulan - 1, tanggal, 12)).getUTCDay();
  return `${NAMA_HARI[hari]}, ${tanggal} ${namaBulan(bulan)} ${tahun}`;
}

function namaBulan(bulan: number): string {
  return [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ][bulan - 1];
}

export function jamWib(detik: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(detik * 1000));
}

export function kelompokkanPerHari(
  jadwal: JadwalTayang[],
): { kunci: string; item: JadwalTayang[] }[] {
  const peta = new Map<string, JadwalTayang[]>();
  for (const tayang of jadwal) {
    const kunci = kunciHariWib(tayang.airingAt);
    const isi = peta.get(kunci) ?? [];
    isi.push(tayang);
    peta.set(kunci, isi);
  }
  return [...peta.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([kunci, item]) => ({
      kunci,
      item: [...item].sort((a, b) => a.airingAt - b.airingAt),
    }));
}
