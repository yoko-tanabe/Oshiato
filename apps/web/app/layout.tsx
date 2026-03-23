import type { Metadata } from "next";
import { Nunito, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "OSHIATO | 推しの足跡を地図に残す",
  description: "推しスポットを地図で共有・記録・辿るアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${nunito.variable} ${zenMaruGothic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
