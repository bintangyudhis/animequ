export default function JudulSeksi({
  id,
  judul,
  keterangan,
}: {
  id: string;
  judul: string;
  keterangan: string;
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
        {judul}
      </h2>
      <span aria-hidden="true" className="mt-3 block h-1 w-10 bg-accent" />
      <p className="mt-2 text-sm text-muted">{keterangan}</p>
    </div>
  );
}
