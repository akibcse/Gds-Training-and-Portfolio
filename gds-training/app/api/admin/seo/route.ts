import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getGlobalSeo, updateGlobalSeo, getPageSeo, updatePageSeo } from "@/lib/cms/seo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const pageSeo = await getPageSeo(slug);
    return NextResponse.json(pageSeo || {});
  }

  const globalSeo = await getGlobalSeo();
  return NextResponse.json(globalSeo || {});
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, ...data } = body;

    if (slug) {
      await updatePageSeo(slug, data);
    } else {
      await updateGlobalSeo(data);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
