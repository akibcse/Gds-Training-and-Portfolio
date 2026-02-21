import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "roadyakib@gmail.com").toLowerCase();

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

  const signInResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: body.currentPassword,
        returnSecureToken: true
      })
    }
  );

  if (!signInResponse.ok) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const signInPayload = (await signInResponse.json()) as { idToken?: string };
  if (!signInPayload.idToken) {
    return NextResponse.json({ error: "Failed to verify current password." }, { status: 400 });
  }

  const changeResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken: signInPayload.idToken,
        password: body.newPassword,
        returnSecureToken: true
      })
    }
  );

  if (!changeResponse.ok) {
    return NextResponse.json({ error: "Failed to update password." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
