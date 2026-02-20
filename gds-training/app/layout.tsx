import type { Metadata } from "next";
import { DM_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getGlobalSeo } from "@/lib/cms/seo";

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
  const seo = await getGlobalSeo();
  const fallbackSiteUrl = "https://airtech-aviation-ota.vercel.app";

  let siteUrl = seo?.siteUrl || fallbackSiteUrl;
  try {
    siteUrl = new URL(siteUrl).toString().replace(/\/$/, "");
  } catch {
    siteUrl = fallbackSiteUrl;
  }

  const siteName = seo?.siteName || "Air Tech Aviation";
  const defaultTitle = seo?.defaultTitle || "GDS Training & Air Ticketing";
  const defaultDescription = seo?.defaultDescription || "Professional GDS Training and Air Ticketing courses in Bangladesh.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: seo?.titleTemplate || `%s | ${siteName}`
    },
    description: defaultDescription,
    keywords: seo?.defaultKeywords || ["GDS", "Training", "Aviation"],
    verification: {
      google: seo?.googleVerification || "8WbeVkSHzkcfWfMiESJhjf4sBnXl28DRN8lNz2sYzl0",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: siteUrl
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: siteUrl,
      siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: seo?.defaultOgImage || `${siteUrl}/api/og?title=${encodeURIComponent(siteName)}`,
          width: 1200,
          height: 630,
          alt: siteName,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      creator: seo?.twitterHandle
    }
  };
}

export const viewport = {
  themeColor: "#0891b2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
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
