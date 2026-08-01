import { getPageSeo } from "@/lib/cms/seo";

export const getSeoOverride = async (pageKey: string) => {
  const pageSeo = await getPageSeo(pageKey);
  if (!pageSeo) return null;

  return {
    pageKey: pageSeo.slug,
    metaTitle: pageSeo.title,
    metaDescription: pageSeo.description,
    keywords: pageSeo.keywords,
    canonicalUrl: pageSeo.slug ? `/${pageSeo.slug.replace(/^\//, "")}` : "",
    ogTitle: pageSeo.title,
    ogDescription: pageSeo.description,
    ogImage: pageSeo.ogImage,
    jsonLd: pageSeo.jsonLd,
  };
};
