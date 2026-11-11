import type { Metadata } from "next";
import { Covered_By_Your_Grace, Shadows_Into_Light } from "next/font/google";
import "./globals.css";

const coveredByYourGrace = Covered_By_Your_Grace({
  variable: "--font-covered-by-your-grace",
  subsets: ["latin"],
  weight: "400",
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows-into-light",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Tò He — Nghệ thuật dân gian Việt Nam",
  description: "Tò He – món đồ chơi dân gian Việt Nam làm bằng bột màu, biểu tượng tuổi thơ và văn hóa truyền thống.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${coveredByYourGrace.variable} ${shadowsIntoLight.variable}`}>
      <body style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
