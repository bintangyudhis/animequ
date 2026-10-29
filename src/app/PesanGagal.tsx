// Pengganti isi seksi saat AniList tidak bisa dihubungi: pesan jujur,
// bukan kartu kosong dan bukan angka karangan.
export default function PesanGagal({ seksi }: { seksi: string }) {
  return (
    <p className="border border-line bg-panel p-4 text-sm leading-relaxed text-muted">
      Daftar {seksi} belum bisa dimuat dari AniList saat ini. Muat ulang
      halaman beberapa saat lagi.
    </p>
  );
}
