import { NextResponse } from "next/server";
import { getCourses, createCourse } from "@/lib/cms/courses";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

export async function GET() {
  const items = await getCourses();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and Slug are required." }, { status: 400 });
    }

    const id = await createCourse(body);
    return NextResponse.json({ id, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
