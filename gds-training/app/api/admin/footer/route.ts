import { NextResponse } from "next/server";
import { getFooterItems, createFooterSection, type FooterSection } from "@/lib/cms/footer";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

const mapFooterObjectToArray = (input: unknown): FooterSection[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input as FooterSection[];
  }

  const records = input as Record<string, Omit<FooterSection, "id">>;
  return Object.entries(records).map(([id, value]) => ({
    id,
    title: value?.title || "",
    content: value?.content || "",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

export async function GET() {
  const items = await getFooterItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const id = await createFooterSection(body);
    return NextResponse.json({ id, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
