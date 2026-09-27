import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 展示字體:幾何無襯線,帶點工程感;等寬字用在編號與標籤
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import IntroCurtain from "@/components/IntroCurtain";
import CursorHalo from "@/components/CursorHalo";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata: Metadata = {
  title: "William | AI 整合 × 機電整合 × 機構設計",
  description:
    "William 的個人網站:AI 整合、機電整合、機構設計。機械手臂 Android 開發、AI 智慧盒等作品集與技術部落格。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning:iOS Chrome 等瀏覽器會自行在 <html> 加屬性,避免無意義的 hydration 警告
    <html
      lang="zh-Hant"
      suppressHydrationWarning
      className={`${display.variable} ${mono.variable}`}
    >
      <head>
        {/* 這個瀏覽階段已看過開場動畫就先標記,避免重新整理時黑幕閃一下 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('intro-played')==='1')document.documentElement.classList.add('intro-seen')}catch(e){}",
          }}
        />
      </head>
      <body className="grain min-h-screen flex flex-col antialiased">
        <IntroCurtain />
        <ScrollProgress />
        <CursorHalo />
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
