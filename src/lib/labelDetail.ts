// Terjemahan nilai enum AniList ke label Indonesia untuk halaman detail.
// Nilai tak dikenal dikembalikan apa adanya, bukan ditebak.
const LABEL_STATUS: Record<string, string> = {
  RELEASING: "Sedang tayang",
  FINISHED: "Selesai",
  NOT_YET_RELEASED: "Belum rilis",
  CANCELLED: "Dibatalkan",
  HIATUS: "Hiatus",
};

const LABEL_FORMAT: Record<string, string> = {
  TV: "Serial TV",
  TV_SHORT: "Serial pendek",
  MOVIE: "Film",
  SPECIAL: "Spesial",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Video musik",
};

export function labelStatus(status: string | null): string {
  if (!status) return "—";
  return LABEL_STATUS[status] ?? status;
}

export function labelFormat(format: string | null): string {
  if (!format) return "—";
  return LABEL_FORMAT[format] ?? format;
}
