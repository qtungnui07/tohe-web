import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&family=Shadows+Into+Light&display=swap" rel="stylesheet" />
      </head>
      <body style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
