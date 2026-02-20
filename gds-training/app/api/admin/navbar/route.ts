import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getNavbar, createNavbarItem } from "@/lib/cms/navbar";

export async function GET() {
  const items = await getNavbar();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
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
