import DaftarHistori from "./DaftarHistori";

// Halaman histori: cangkang server statis + daftar klien yang membaca
// localStorage, seperti halaman favorit — tidak ada data pribadi yang
// menyentuh server.
export default function Histori() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Histori tontonan
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Anime yang halaman detailnya pernah kamu buka, terbaru di atas.
          Daftar ini hanya ada di browser ini — ganti perangkat atau hapus
          data situs, dan daftar ini ikut hilang.
        </p>
      </div>
      <DaftarHistori />
    </div>
  );
}
