import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FiloTakip - Filo Kiralama Yönetim Sistemi",
  description: "Filo araçlarınızın kiralama, gider, bakım ve gelir takibini kolayca yapın. Detaylı raporlar ve analizlerle filonuzu yönetin.",
  keywords: ["filo yönetimi", "araç kiralama", "filo takip", "rent a car", "gider takip"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
