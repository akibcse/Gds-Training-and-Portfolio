import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getBlogs, createBlog } from "@/lib/cms/blogs";

export async function GET() {
  const items = await getBlogs();
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

    const id = await createBlog(body);
    return NextResponse.json({ id, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
