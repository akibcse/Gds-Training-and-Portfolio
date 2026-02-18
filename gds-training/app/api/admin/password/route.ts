import { NextResponse } from "next/server";
import { changeAdminPassword, isAdminAuthenticated } from "@/lib/admin";

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (body.newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  if (body.newPassword !== body.confirmPassword) {
    return NextResponse.json({ error: "New password and confirm password do not match." }, { status: 400 });
  }

  const changed = await changeAdminPassword(body.currentPassword, body.newPassword);

  if (!changed) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
