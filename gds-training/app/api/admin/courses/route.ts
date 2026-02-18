import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get, push, ref, remove, set, update, type Database, type DatabaseReference } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";
import type { CourseRecord } from "@/lib/admin-data";

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

const validate = (course: CourseRecord) => Boolean(course.title && course.slug);

const mapCoursesObjectToArray = (input: unknown): CourseRecord[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.map((item, index) => ({
      ...item,
      id: item.id || String(index)
    }));
  }

  const records = input as Record<string, Omit<CourseRecord, "id">>;
  return Object.entries(records).map(([id, value]) => ({
    id,
    ...value
  }));
};

const resolveCourseRef = async (db: Database, courseId: string): Promise<DatabaseReference | null> => {
  const directRef = ref(db, `courses/${courseId}`);
  const directSnapshot = await get(directRef);
  if (directSnapshot.exists()) {
    return directRef;
  }

  const allSnapshot = await get(ref(db, "courses"));
  const raw = allSnapshot.val();
  if (!raw) {
    return null;
  }

  if (Array.isArray(raw)) {
    const index = raw.findIndex((item) => item?.id === courseId);
    if (index !== -1) {
      return ref(db, `courses/${index}`);
    }
    return null;
  }

  const entries = Object.entries(raw as Record<string, { id?: string }>);
  const byNestedId = entries.find(([, value]) => value?.id === courseId);
  if (!byNestedId) {
    return null;
  }

  return ref(db, `courses/${byNestedId[0]}`);
};

export async function GET(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ courses: [] });
  }

  const snapshot = await get(ref(db, "courses"));
  const courses = mapCoursesObjectToArray(snapshot.val());
  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const body = (await request.json()) as Partial<CourseRecord>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const snapshot = await get(ref(db, "courses"));
  const courses = mapCoursesObjectToArray(snapshot.val());
  if (courses.some((item) => item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  const itemRef = push(ref(db, "courses"));
  await set(itemRef, { ...row, id: undefined });

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ success: true, course: { ...row, id: itemRef.key } });
}

export async function PUT(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const body = (await request.json()) as Partial<CourseRecord>;
  const row = normalize(body);
  if (!validate(row)) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  if (!row.id) {
    return NextResponse.json({ error: "Course id is required." }, { status: 400 });
  }

  const itemRef = await resolveCourseRef(db, row.id);
  if (!itemRef) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const snapshot = await get(ref(db, "courses"));
  const courses = mapCoursesObjectToArray(snapshot.val());
  if (courses.some((item) => item.id !== row.id && item.slug === row.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  const currentSnapshot = await get(itemRef);
  const currentValue = currentSnapshot.val() || {};
  const normalizedWrite =
    currentValue && typeof currentValue === "object" && "id" in currentValue
      ? { ...row }
      : { ...row, id: undefined };

  await update(itemRef, normalizedWrite);

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ success: true, course: row });
}

export async function DELETE(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const itemRef = await resolveCourseRef(db, id);
  if (!itemRef) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  await remove(itemRef);

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ success: true });
}
