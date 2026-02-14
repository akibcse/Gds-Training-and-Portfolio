import { NextResponse } from "next/server";
import { getBlogs, setBlogs, type BlogRecord } from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin";

const normalize = (input: Partial<BlogRecord>): BlogRecord => {
  const slug = (input.slug ?? "").trim().toLowerCase();
  return {
    id: input.id ?? crypto.randomUUID(),
    slug,
    title: (input.title ?? "").trim(),
    excerpt: (input.excerpt ?? "").trim(),
    description: (input.description ?? "").trim(),
    publishedAt: (input.publishedAt ?? new Date().toISOString().slice(0, 10)).trim(),
    author: (input.author ?? "").trim(),
    keywords: Array.isArray(input.keywords) ? input.keywords.filter(Boolean) : [],
    content: Array.isArray(input.content) ? input.content.filter(Boolean) : [],
    relatedSlugs: Array.isArray(input.relatedSlugs) ? input.relatedSlugs.filter(Boolean) : []
  };
};

const validate = (post: BlogRecord) => post.title && post.slug;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const blogs = await getBlogs();
  return NextResponse.json({ blogs });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<BlogRecord>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const blogs = await getBlogs();
  if (blogs.some((item) => item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  await setBlogs([row, ...blogs]);
  return NextResponse.json({ success: true, blog: row });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<BlogRecord>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const blogs = await getBlogs();
  const index = blogs.findIndex((item) => item.id === row.id);
  if (index === -1) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  if (blogs.some((item) => item.id !== row.id && item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  blogs[index] = row;
  await setBlogs(blogs);
  return NextResponse.json({ success: true, blog: row });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const blogs = await getBlogs();
  const next = blogs.filter((item) => item.id !== id);
  if (next.length === blogs.length) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  await setBlogs(next);
  return NextResponse.json({ success: true });
}
