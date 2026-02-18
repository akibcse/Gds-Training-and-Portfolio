import { NextResponse } from "next/server";
import { changeAdminEmail, getAdminEmail, isAdminAuthenticated } from "@/lib/admin";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const email = await getAdminEmail();
  return NextResponse.json({ email });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string };

  if (!body.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  }

  const changed = await changeAdminEmail(body.email);

  if (!changed) {
    return NextResponse.json({ error: "Failed to update email." }, { status: 500 });
  }

  return NextResponse.json({ success: true, email: body.email });
}
