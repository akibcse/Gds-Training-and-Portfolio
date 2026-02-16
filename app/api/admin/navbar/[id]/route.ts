import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("DELETE /api/admin/navbar/[id] called");
  
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

  const items = await readJsonFile<Array<{id: string, label: string, url: string, order: number, isActive: boolean}>>("navbar.json");
  console.log("Current items:", items.length);
  
  const filtered = items.filter((item) => item.id !== id);
  await writeJsonFile("navbar.json", filtered);
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("PUT /api/admin/navbar/[id] called");
  
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

  const items = await readJsonFile<Array<{id: string, label: string, url: string, order: number, isActive: boolean}>>("navbar.json");
  console.log("Current items:", items.length);
  
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    console.log("Item not found for ID:", id);
    console.log("Available IDs:", items.map(i => i.id));
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  items[index] = { ...items[index], ...body };
  await writeJsonFile("navbar.json", items);
  return NextResponse.json(items[index]);
}
