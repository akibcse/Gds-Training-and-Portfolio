import type { Metadata } from "next";
import { DM_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ClientInit from "@/components/ClientInit";
import { getGlobalSeo } from "@/lib/cms/seo";
import ChatWidget from "@/components/ChatWidget";

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
  const fallbackGoogleVerification = "wyMy_PJ7kZvizW2GTPUZN9NSmNTaDjsbdjcJ3C3hrlY";

  const normalizeGoogleVerification = (value?: string | null) => {
    if (!value) return fallbackGoogleVerification;

    const trimmed = value.trim();
    const contentMatch = trimmed.match(/content\s*=\s*['\"]([^'\"]+)['\"]/i);

    if (contentMatch?.[1]) {
      return contentMatch[1];
    }

    return trimmed;
  };

  let siteUrl = seo?.siteUrl || fallbackSiteUrl;
  try {
    siteUrl = new URL(siteUrl).toString().replace(/\/$/, "");
  } catch {
    siteUrl = fallbackSiteUrl;
  }

  const siteName = seo?.siteName || "Md. Akib Hasan";
  const defaultTitle = seo?.defaultTitle || "Get personalized GDS training from Md. Akib Hasan";
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
      google: normalizeGoogleVerification(seo?.googleVerification),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: siteUrl
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
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
        <ClientInit />
        <Navbar />
        <PageTransition>
          <main className="pb-20 md:pb-0">{children}</main>
        </PageTransition>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
