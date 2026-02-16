import { NextResponse } from "next/server";
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

  const items = await readJsonFile<Array<{id: string, label: string, url: string, order: number, isActive: boolean}>>("navbar.json");
  const filtered = items.filter((item) => item.id !== id);
  await writeJsonFile("navbar.json", filtered);
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

  const items = await readJsonFile<Array<{id: string, label: string, url: string, order: number, isActive: boolean}>>("navbar.json");
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  items[index] = { ...items[index], ...body };
  await writeJsonFile("navbar.json", items);
  return NextResponse.json(items[index]);
}
