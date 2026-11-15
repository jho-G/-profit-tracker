import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ልዩ ሽሮ (Liyu Shiro) - Restaurant Profit Tracker & Digital Menu",
    template: "%s | ልዩ ሽሮ (Liyu Shiro)",
  },
  description: "ልዩ ሽሮ የትርፍ መከታተያ፣ የሽያጭ መመዝገቢያ እና የደንበኞች ዲጂታል ሜኑ (Liyu Shiro Restaurant Profit Tracker, Sale Logger & Customer QR Menu).",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ልዩ ሽሮ (Liyu Shiro) - Profit Tracker & Digital Menu",
    description: "የልዩ ሽሮ የዕለት እና የወርሃዊ ትርፍ መከታተያ እና የዲጂታል ሜኑ ሥርዓት",
    type: "website",
    locale: "am_ET",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
