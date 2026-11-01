// Pengganti isi seksi saat AniList tidak bisa dihubungi: pesan jujur,
// bukan kartu kosong dan bukan angka karangan.
export default function PesanGagal({ seksi }: { seksi: string }) {
  return (
    <div className="flex flex-col gap-1 border border-line bg-panel p-4">
      <p className="text-sm font-bold">Belum bisa memuat daftar ini</p>
      <p className="text-sm leading-relaxed text-muted">
        Daftar {seksi} belum bisa dimuat dari AniList saat ini. Muat ulang
        halaman beberapa saat lagi.
      </p>
    </div>
  );
}
