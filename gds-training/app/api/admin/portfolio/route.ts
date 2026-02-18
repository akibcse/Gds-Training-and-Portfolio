import { NextResponse } from "next/server";
import { getProjects, setProjects, type PortfolioProject } from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin";

export const dynamic = 'force-dynamic';


const normalize = (input: Partial<PortfolioProject>): PortfolioProject => {
  const slug = (input.slug ?? "").trim().toLowerCase();
  return {
    id: input.id ?? crypto.randomUUID(),
    slug,
    title: (input.title ?? "").trim(),
    category: (input.category ?? "").trim(),
    description: (input.description ?? "").trim(),
    caseStudy: (input.caseStudy ?? "").trim(),
    technologies: Array.isArray(input.technologies) ? input.technologies.filter(Boolean) : [],
    imageUrl: (input.imageUrl ?? "").trim()
  };
};

const validate = (project: PortfolioProject) => project.title && project.slug;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<PortfolioProject>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const projects = await getProjects();
  if (projects.some((item) => item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  await setProjects([row, ...projects]);
  return NextResponse.json({ success: true, project: row });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<PortfolioProject>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const projects = await getProjects();
  const index = projects.findIndex((item) => item.id === row.id);
  if (index === -1) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (projects.some((item) => item.id !== row.id && item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  projects[index] = row;
  await setProjects(projects);
  return NextResponse.json({ success: true, project: row });
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

  const projects = await getProjects();
  const next = projects.filter((item) => item.id !== id);
  if (next.length === projects.length) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  await setProjects(next);
  return NextResponse.json({ success: true });
}
