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
      <body style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
