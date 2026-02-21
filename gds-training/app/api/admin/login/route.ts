import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "roadyakib@gmail.com").toLowerCase();

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Unauthorized admin credentials." }, { status: 401 });
  }

  if (body.email.trim().toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized admin credentials." }, { status: 401 });
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim(), password: body.password, returnSecureToken: true })
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Unauthorized admin credentials." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ success: true });
}
