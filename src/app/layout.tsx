import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Последний король — Самогенерирующийся роман",
  description:
    "Эпический роман об инопланетной цивилизации, создаваемый искусственным интеллектом глава за главой",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
