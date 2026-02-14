import type { MetadataRoute } from "next";
import { getSeo } from "@/lib/getData";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"]
      }
    ],
    sitemap: `${seo.siteUrl}/sitemap.xml`,
    host: seo.siteUrl
  };
}
