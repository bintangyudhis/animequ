import { Suspense } from "react";
import BagianMusim from "./BagianMusim";
import BagianSedangTayang from "./BagianSedangTayang";
import BagianTrending from "./BagianTrending";

// Pola pendekin Day 6: cangkang halaman statis + komponen server async di
// dalam Suspense, jadi kegagalan fetch AniList tidak menggagalkan build
// maupun render cangkang (Partial Prerender).
export function BagianBeranda() {
  return (
    <>
      <Suspense
        fallback={
          <p className="text-sm text-muted">Memuat anime yang sedang tayang…</p>
        }
      >
        <BagianSedangTayang />
      </Suspense>
      <Suspense
        fallback={<p className="text-sm text-muted">Memuat daftar trending…</p>}
      >
        <BagianTrending />
      </Suspense>
      <Suspense
        fallback={<p className="text-sm text-muted">Memuat chart musim ini…</p>}
      >
        <BagianMusim />
      </Suspense>
    </>
  );
}
