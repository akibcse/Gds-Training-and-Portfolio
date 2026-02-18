import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get, ref, remove, update } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyFirebaseAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const sectionRef = ref(db, `footer/${id}`);
  const snapshot = await get(sectionRef);
  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  await remove(sectionRef);
  revalidatePath("/");
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyFirebaseAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const { id } = await params;
  const body = (await req.json()) as Partial<{
    title: string;
    content: string;
    order: number;
    isActive: boolean;
  }>;

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const sectionRef = ref(db, `footer/${id}`);
  const snapshot = await get(sectionRef);
  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const nextValue = {
    ...snapshot.val(),
    ...body
  };

  await update(sectionRef, nextValue);
  revalidatePath("/");
  return NextResponse.json({ id, ...nextValue });
}
