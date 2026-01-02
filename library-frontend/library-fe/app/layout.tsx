"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/component/header";
import SnowfallEffect from "@/component/SnowfallEffect";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // ✨ HÀM XỬ LÝ SEARCH TỪ HEADER
  const handleHeaderSearch = (query: string) => {
    // Dispatch custom event để HomePage có thể lắng nghe
    window.dispatchEvent(new CustomEvent('header-search', { 
      detail: { query } 
    }));
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header onSearch={handleHeaderSearch} />
        <SnowfallEffect />
        {children}
      </body>
    </html>
  );
}