import { getPageSeo } from "@/lib/cms/seo";

export const getSeoOverride = async (pageKey: string) => {
  const pageSeo = await getPageSeo(pageKey);
  if (!pageSeo) return null;

  return {
    pageKey: pageSeo.slug,
    metaTitle: pageSeo.title,
    metaDescription: pageSeo.description,
    keywords: pageSeo.keywords,
    canonicalUrl: "", // We can add this to the CMS PageSeo if needed
    ogTitle: pageSeo.title,
    ogDescription: pageSeo.description,
  };
};
