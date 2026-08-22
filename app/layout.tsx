import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "William | AI 整合 × 機電整合 × 機構設計",
  description:
    "William 的個人網站:AI 整合、機電整合、機構設計。機械手臂 Android 開發、AI 智慧盒等作品集與技術部落格。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
