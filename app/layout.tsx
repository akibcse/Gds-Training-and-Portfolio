import type { Metadata } from "next";
import { DM_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getSeo } from "@/lib/getData";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
  display: "swap",
  fallback: ["Segoe UI", "Arial", "sans-serif"]
});
const serif = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["700"],
  preload: true,
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"]
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const siteUrl = seo?.siteUrl || 'https://gds-training.vercel.app';
  
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo?.defaultTitle || 'GDS Training',
      template: seo?.titleTemplate || '%s'
    },
    description: seo?.defaultDescription || 'GDS Training in Dhaka',
    keywords: seo?.defaultKeywords || [],
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: seo.siteUrl,
      siteName: seo.siteName,
      locale: seo.locale,
      type: "website"
    },
    twitter: {
      card: seo.twitterCard ?? "summary_large_image",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      creator: seo.twitterHandle
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <meta name="google-site-verification" content="8WbeVkSHzkcfWfMiESJhjf4sBnXl28DRN8lNz2sYzl0" />
        <meta name="robots" content="index, follow" />
      </head>
      <body className="font-[var(--font-sans)] text-ink">
        <Navbar />
        <PageTransition>
          <main className="pb-20 md:pb-0">{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
