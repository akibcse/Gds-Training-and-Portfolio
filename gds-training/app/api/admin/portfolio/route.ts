import { NextResponse } from "next/server";
import { get, push, ref, remove, set, update } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

export const dynamic = 'force-dynamic';

const normalize = (input: any) => {
  return {
    title: (input.title || "").trim(),
    slug: (input.slug || "").trim().toLowerCase(),
    category: (input.category || "").trim(),
    description: (input.description || "").trim(),
    caseStudy: (input.caseStudy || "").trim(),
    technologies: Array.isArray(input.technologies) ? input.technologies.filter(Boolean) : [],
    imageUrl: (input.imageUrl || "").trim()
  };
};

export async function GET(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  const snapshot = await get(ref(db, "portfolio"));
  const data = snapshot.val();

  if (!data) {
    return NextResponse.json({ projects: [] });
  }

  const projects = Object.entries(data).map(([id, value]: [string, any]) => ({
    id,
    ...value
  }));

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  const body = await request.json();
  const row = normalize(body);

  if (!row.title || !row.slug) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const newRef = push(ref(db, "portfolio"));
  await set(newRef, { ...row, createdAt: Date.now() });

  return NextResponse.json({ success: true, project: { id: newRef.key, ...row } });
}

export async function PUT(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  const body = await request.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
  }

  const row = normalize(rest);
  await update(ref(db, `portfolio/${id}`), row);

  return NextResponse.json({ success: true, project: { id, ...row } });
}

export async function DELETE(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  await remove(ref(db, `portfolio/${id}`));

  return NextResponse.json({ success: true });
}
