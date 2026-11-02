import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { ConfigProvider } from "@/components/config";
import { publicConfig } from "@/lib/config";
import "./globals.css";

const serif = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const sans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Skinmatch: your skincare routine, checked by AI",
    template: "%s · Skinmatch",
  },
  description:
    "Snap your shelf. Skinmatch finds the products that cancel each other out and puts your morning and night routine in the right order.",
  applicationName: "Skinmatch",
  appleWebApp: { capable: true, title: "Skinmatch", statusBarStyle: "default" },
  openGraph: { type: "website", siteName: "Skinmatch" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} antialiased`}>
      <body className="min-h-dvh">
        <ConfigProvider value={publicConfig()}>{children}</ConfigProvider>
      </body>
    </html>
  );
}
