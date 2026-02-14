import { NextResponse } from "next/server";
import { getCourses, setCourses, type CourseRecord } from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin";

const normalize = (input: Partial<CourseRecord>): CourseRecord => {
  const slug = (input.slug ?? "").trim().toLowerCase();
  return {
    id: input.id ?? crypto.randomUUID(),
    slug,
    title: (input.title ?? "").trim(),
    excerpt: (input.excerpt ?? "").trim(),
    description: (input.description ?? "").trim(),
    duration: (input.duration ?? "").trim(),
    certification: (input.certification ?? "").trim(),
    mode: (input.mode ?? "").trim(),
    softwareCovered: Array.isArray(input.softwareCovered) ? input.softwareCovered.filter(Boolean) : [],
    curriculum: Array.isArray(input.curriculum) ? input.curriculum.filter(Boolean) : [],
    careerOutcomes: Array.isArray(input.careerOutcomes) ? input.careerOutcomes.filter(Boolean) : [],
    faqs: Array.isArray(input.faqs)
      ? input.faqs
          .map((faq) => ({ question: faq.question?.trim() ?? "", answer: faq.answer?.trim() ?? "" }))
          .filter((faq) => faq.question && faq.answer)
      : [],
    keywords: Array.isArray(input.keywords) ? input.keywords.filter(Boolean) : [],
    relatedBlogSlugs: Array.isArray(input.relatedBlogSlugs) ? input.relatedBlogSlugs.filter(Boolean) : []
  };
};

const validate = (course: CourseRecord) => course.title && course.slug;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const courses = await getCourses();
  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<CourseRecord>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const courses = await getCourses();
  if (courses.some((item) => item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  await setCourses([row, ...courses]);
  return NextResponse.json({ success: true, course: row });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<CourseRecord>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const courses = await getCourses();
  const index = courses.findIndex((item) => item.id === row.id);
  if (index === -1) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  if (courses.some((item) => item.id !== row.id && item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  courses[index] = row;
  await setCourses(courses);
  return NextResponse.json({ success: true, course: row });
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

  const courses = await getCourses();
  const next = courses.filter((item) => item.id !== id);
  if (next.length === courses.length) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  await setCourses(next);
  return NextResponse.json({ success: true });
}
