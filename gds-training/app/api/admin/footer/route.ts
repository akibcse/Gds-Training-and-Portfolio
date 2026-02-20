import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getFooterItems, createFooterSection } from "@/lib/cms/footer";

export async function GET() {
  const items = await getFooterItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
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
