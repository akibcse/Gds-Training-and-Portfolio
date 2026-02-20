import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getPortfolioProjects, createPortfolioProject } from "@/lib/cms/portfolio";

export async function GET() {
  const items = await getPortfolioProjects();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and Slug are required." }, { status: 400 });
    }

    const id = await createPortfolioProject(body);
    return NextResponse.json({ id, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
