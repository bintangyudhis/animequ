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
      <p className="mt-1 text-sm text-muted">{keterangan}</p>
    </div>
  );
}
