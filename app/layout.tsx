import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToiletsProvider } from "@/context/ToiletsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toilet.uz — eng yaqin hojatxonalarni toping",
  description:
    "O'zbekistondagi jamoat hojatxonalari, savdo markazlari va yoqilg'i shoxobchalari xaritasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToiletsProvider>{children}</ToiletsProvider>
      </body>
    </html>
  );
}
