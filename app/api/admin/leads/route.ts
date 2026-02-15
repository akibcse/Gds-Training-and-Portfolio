import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  latestCourse: string;
  source: "registration" | "booking";
  status: "new" | "contacted" | "enrolled";
  updatedAt: string;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, registrations, bookings] = await Promise.all([
    readJsonFile<UserRecord[]>("users.json"),
    readJsonFile("registrations.json"),
    readJsonFile("bookings.json")
  ]);

  return NextResponse.json({ users, registrations, bookings });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; status?: UserRecord["status"] };

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const users = await readJsonFile<UserRecord[]>("users.json");
  const target = users.find((user) => user.id === body.id);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  target.status = body.status;
  target.updatedAt = new Date().toISOString();
  await writeJsonFile("users.json", users);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "user";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let fileName = "users.json";
  if (type === "registration") fileName = "registrations.json";
  if (type === "booking") fileName = "bookings.json";

  const data = await readJsonFile<any[]>(fileName);
  const next = data.filter((item) => item.id !== id);

  if (next.length === data.length) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await writeJsonFile(fileName, next);
  return NextResponse.json({ success: true });
}
