import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get, ref, update } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

export const dynamic = 'force-dynamic';

const DEFAULT_GLOBAL = {
  siteUrl: "https://gds-training.vercel.app",
  siteName: "GDS Training Bangladesh",
  defaultTitle: "GDS Training in Bangladesh | Amadeus, Sabre & Travelport Certification",
  titleTemplate: "%s | GDS Training Bangladesh",
  defaultDescription: "Join practical GDS Training in Bangladesh. Learn Amadeus, Sabre, and Travelport for airline careers with certified instructors, labs, and placement support.",
  defaultKeywords: ["GDS Training in Bangladesh"],
  twitterHandle: "@roadyakib",
  locale: "en_US",
  twitterCard: "summary_large_image",
  googleVerification: "",
  bingVerification: ""
};

export async function GET(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  const snapshot = await get(ref(db, "seo"));
  const data = snapshot.val() || {};

  return NextResponse.json({
    global: { ...DEFAULT_GLOBAL, ...(data.global || {}) },
    pages: data.pageLevelSeo ? Object.values(data.pageLevelSeo) : []
  });
}

export async function PUT(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  const body = (await request.json()) as { global?: any; pages?: any[] };

  if (!body.global) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Structure internal pageLevelSeo object for efficient lookup if needed
  const pageLevelSeo: Record<string, any> = {};
  if (Array.isArray(body.pages)) {
    body.pages.forEach(p => {
      if (p.pageKey) pageLevelSeo[p.pageKey] = p;
    });
  }

  const updates: Record<string, any> = {
    "seo/global": body.global,
    "seo/pageLevelSeo": pageLevelSeo
  };

  await update(ref(db), updates);

  revalidatePath("/", "layout"); // Revalidate everything that uses layout

  return NextResponse.json({ success: true });
}
