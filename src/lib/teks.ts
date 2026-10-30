// Sinopsis AniList mengandung tag HTML (<br>, <i>, dsb.) dan kadang
// pemisah "---" untuk catatan sumber. Untuk tampilan, tag dibuang dan
// teks dirapikan; bila kosong, pemanggil menampilkan pesan pengganti.
export function bersihkanDeskripsi(deskripsi: string | null): string {
  if (!deskripsi) return "";
  return deskripsi
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/---[\s\S]*$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
