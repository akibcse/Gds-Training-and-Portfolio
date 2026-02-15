import { NextResponse } from "next/server";
import { getSeoGlobal, getSeoPages, setSeoGlobal, setSeoPages, type SeoGlobal, type SeoPageEntry } from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin";

export const dynamic = 'force-dynamic';


const normalizeGlobal = (input: Partial<SeoGlobal>): SeoGlobal => ({
  siteUrl: (input?.siteUrl ?? "").trim() || "",
  siteName: (input?.siteName ?? "").trim() || "",
  defaultTitle: (input?.defaultTitle ?? "").trim() || "",
  titleTemplate: (input?.titleTemplate ?? "").trim() || "%s",
  defaultDescription: (input?.defaultDescription ?? "").trim() || "",
  defaultKeywords: Array.isArray(input?.defaultKeywords) ? input.defaultKeywords.filter(Boolean) : [],
  twitterHandle: (input?.twitterHandle ?? "").trim() || "",
  locale: (input?.locale ?? "en_US").trim() || "en_US",
  defaultOgImage: (input?.defaultOgImage ?? "").trim() || "",
  twitterCard: input?.twitterCard === "summary" ? "summary" : "summary_large_image",
  googleVerification: (input?.googleVerification ?? "").trim() || "",
  bingVerification: (input?.bingVerification ?? "").trim() || ""
});

const normalizePages = (items: SeoPageEntry[]) =>
  (Array.isArray(items) ? items : [])
    .map((item) => ({
      pageKey: item?.pageKey?.trim() || "",
      metaTitle: item?.metaTitle?.trim() || "",
      metaDescription: item?.metaDescription?.trim() || "",
      keywords: Array.isArray(item?.keywords) ? item.keywords.filter(Boolean) : [],
      canonicalUrl: item?.canonicalUrl?.trim() || "",
      ogTitle: item?.ogTitle?.trim() || "",
      ogDescription: item?.ogDescription?.trim() || "",
      structuredDataOn: item?.structuredDataOn ?? true
    }))
    .filter((item) => item.pageKey);

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [global, pages] = await Promise.all([getSeoGlobal(), getSeoPages()]);
  return NextResponse.json({ global, pages });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { global?: Partial<SeoGlobal>; pages?: SeoPageEntry[] };

  if (!body.global || !Array.isArray(body.pages)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const global = normalizeGlobal(body.global);
  if (!global.siteUrl || !global.defaultTitle || !global.defaultDescription) {
    return NextResponse.json({ error: "Site URL, default title, and default description are required." }, { status: 400 });
  }

  const pages = normalizePages(body.pages);
  await Promise.all([setSeoGlobal(global), setSeoPages(pages)]);

  return NextResponse.json({ success: true });
}
