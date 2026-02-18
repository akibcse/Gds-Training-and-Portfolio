import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const sections = await readJsonFile<Array<{id: string, title: string, content: string, order: number, isActive: boolean}>>("footer.json");
  const filtered = sections.filter((section) => section.id !== id);
  await writeJsonFile("footer.json", filtered);
  revalidatePath("/");
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const sections = await readJsonFile<Array<{id: string, title: string, content: string, order: number, isActive: boolean}>>("footer.json");
  const index = sections.findIndex((section) => section.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  sections[index] = { ...sections[index], ...body };
  await writeJsonFile("footer.json", sections);
  revalidatePath("/");
  return NextResponse.json(sections[index]);
}
