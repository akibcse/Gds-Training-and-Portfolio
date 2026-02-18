import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminCredentials } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!body.email || !body.password || !(await verifyAdminCredentials(body.email, body.password))) {
    return NextResponse.json({ error: "Unauthorized admin credentials." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ success: true });
}
