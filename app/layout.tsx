import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belijdeniscatechese Bethlehemkerk",
  description: "Leer- en oefenomgeving bij de belijdeniscatechese",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
