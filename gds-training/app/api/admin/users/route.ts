import { NextResponse } from "next/server";
import { getUsers } from "@/lib/cms/users";
import { isAdminAuthenticated } from "@/lib/admin";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getUsers();
  return NextResponse.json(items);
}
