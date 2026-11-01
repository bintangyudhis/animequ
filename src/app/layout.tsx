import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import BilahAtas from "./BilahAtas";
import KakiHalaman from "./KakiHalaman";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Animequ — Anime yang Sedang Tayang & Trending",
  description:
    "Animequ menampilkan anime yang sedang tayang, yang sedang tren, chart musim ini, jadwal rilis mingguan, dan top anime dari data AniList, plus favorit dan histori yang tersimpan di browsermu. Tanpa video bajakan: trailer dan tautan ke platform resmi.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-paper"
        >
          Lewati ke konten
        </a>
        <BilahAtas />
        <main id="konten">{children}</main>
        <KakiHalaman />
      </body>
    </html>
  );
}
