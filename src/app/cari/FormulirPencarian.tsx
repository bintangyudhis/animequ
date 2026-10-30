// Formulir pencarian di halaman /cari: GET biasa, jadi hasil bisa
// dibagikan lewat URL (?q=...) dan tidak butuh JavaScript klien.
export default function FormulirPencarian({
  nilaiAwal,
}: {
  nilaiAwal: string;
}) {
  return (
    <form action="/cari" method="get" role="search" className="flex gap-2">
      <label className="sr-only" htmlFor="cari-halaman">
        Cari anime
      </label>
      <input
        id="cari-halaman"
        name="q"
        type="search"
        defaultValue={nilaiAwal}
        placeholder="Mis. Frieren, One Piece…"
        className="min-w-0 flex-1 border border-line bg-panel px-4 py-3 text-base placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 bg-accent px-5 py-3 text-sm font-bold text-paper transition-opacity hover:opacity-90"
      >
        Cari
      </button>
    </form>
  );
}
