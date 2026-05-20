import type { Metadata, Viewport } from "next";
import { Fredoka, Noto_Sans_Thai } from "next/font/google";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "Kids Game Zone | เกมสนุกสำหรับเด็ก",
  description: "คลังเกมสนุกสำหรับเด็กเล็ก อายุ 2-5 ปี - จิ๊กซอว์, ระบายสี, จับคู่ภาพ, เปียโนสัตว์",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kids Game",
  },
  icons: {
    icon: [
      { url: "/assets/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/icons/icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/assets/icons/icon-120.png", sizes: "120x120" },
      { url: "/assets/icons/icon-152.png", sizes: "152x152" },
      { url: "/assets/icons/icon-180.png", sizes: "180x180" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#667eea",
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${fredoka.variable} ${notoSansThai.variable}`}
    >
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
