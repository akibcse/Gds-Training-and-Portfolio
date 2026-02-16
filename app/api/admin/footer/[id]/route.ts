import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("DELETE /api/admin/footer/[id] called");
  
  const isAuth = await isAdminAuthenticated();
  console.log("Is authenticated:", isAuth);
  
  if (!isAuth) {
    console.log("Unauthorized DELETE");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log("Delete ID:", id);

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const sections = await readJsonFile<Array<{id: string, title: string, content: string, order: number, isActive: boolean}>>("footer.json");
  console.log("Current sections:", sections.length);
  
  const filtered = sections.filter((section) => section.id !== id);
  await writeJsonFile("footer.json", filtered);
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("PUT /api/admin/footer/[id] called");
  
  const isAuth = await isAdminAuthenticated();
  console.log("Is authenticated:", isAuth);
  
  if (!isAuth) {
    console.log("Unauthorized PUT");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  console.log("Update ID:", id, "Body:", body);

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const sections = await readJsonFile<Array<{id: string, title: string, content: string, order: number, isActive: boolean}>>("footer.json");
  console.log("Current sections:", sections.length);
  
  const index = sections.findIndex((section) => section.id === id);

  if (index === -1) {
    console.log("Section not found for ID:", id);
    console.log("Available IDs:", sections.map(s => s.id));
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  sections[index] = { ...sections[index], ...body };
  await writeJsonFile("footer.json", sections);
  return NextResponse.json(sections[index]);
}
