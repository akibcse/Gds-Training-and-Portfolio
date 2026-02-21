import { NextResponse } from "next/server";
import { getNavbar, createNavbarItem, type NavbarItem } from "@/lib/cms/navbar";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

const mapNavbarObjectToArray = (input: unknown): NavbarItem[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input as NavbarItem[];
  }

  const records = input as Record<string, Omit<NavbarItem, "id">>;
  return Object.entries(records).map(([id, value]) => ({
    id,
    label: value?.label || "",
    url: value?.url || "/",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

export async function GET() {
  const items = await getNavbar();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.label || !body.url) {
      return NextResponse.json({ error: "Label and URL are required." }, { status: 400 });
    }

    const id = await createNavbarItem(body);
    return NextResponse.json({ id, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
