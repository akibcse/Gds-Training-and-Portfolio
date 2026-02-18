import type { MetadataRoute } from "next";
import { getSeo } from "@/lib/getData";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const DEFAULT_URL = "https://gds-training.vercel.app";
  
  let siteUrl = DEFAULT_URL;
  
  try {
    const seo = await getSeo();
    siteUrl = seo?.siteUrl || DEFAULT_URL;
  } catch (e) {
    console.error("Robots: Failed to get SEO settings", e);
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
