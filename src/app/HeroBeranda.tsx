export default function HeroBeranda() {
  return (
    <section className="flex flex-col gap-4 border-b-4 border-accent pb-8">
      <p className="font-mono text-xs tracking-widest text-accent uppercase">
        Data: AniList · diperbarui tiap 30 menit
      </p>
      <h1 className="max-w-3xl text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl">
        Anime yang sedang tayang, tanpa ribet.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
        Lihat apa yang sedang rilis minggu ini, apa yang sedang ramai
        dibicarakan, dan apa saja judul musim berjalan. Klik sebuah judul
        untuk membuka detailnya, lengkap dengan trailer dan tautan
        nonton resmi. Cari judul, simpan favoritmu, dan lihat kembali
        riwayat tontonanmu.
      </p>
    </section>
  );
}
