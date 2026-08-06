import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { headers } from "next/headers";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: true,
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Óticas Lírio | Um amor por cada óculos!",
    template: "%s | Óticas Lírio",
  },
  description:
    "Óticas Lírio em Ribeirão Pires/SP. Catálogo de óculos e atendimento personalizado.",
  metadataBase: new URL("https://oticaslirio.local"),
  openGraph: {
    title: "Óticas Lírio",
    description: "Um amor por cada óculos! Catálogo e atendimento próximo.",
    locale: "pt_BR",
    type: "website",
    images: ["/logos/social-1080x1080.png"],
  },
  icons: {
    icon: [
      { url: "/logos/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/logos/icon-180x180.png", sizes: "180x180" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        {isAdmin ? (
          children
        ) : (
          <>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
