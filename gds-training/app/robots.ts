import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSeo } from "@/lib/getData";

const DEFAULT_URL = "https://akibhasan.online";

const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return DEFAULT_URL;

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_URL;
  }
};

const resolveBaseUrl = async () => {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");

    if (host) {
      const protocol = h.get("x-forwarded-proto") || "https";
      return normalizeBaseUrl(`${protocol}://${host}`);
    }
  } catch {
    // no-op: fallback to CMS/default URL below
  }

  try {
    const seo = await getSeo();
    return normalizeBaseUrl(seo?.siteUrl);
  } catch (e) {
    console.error("Robots: Failed to get SEO settings", e);
    return DEFAULT_URL;
  }
};

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await resolveBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"]
      }
    ],
    sitemap: new URL("/sitemap.xml", `${siteUrl}/`).toString()
  };
}
