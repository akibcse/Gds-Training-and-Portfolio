import { NextResponse } from "next/server";
import { getProfileRecord } from "@/lib/admin-data";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await getProfileRecord();
    return NextResponse.json({
      name: profile?.name || "Md. Akib Hasan",
      instituteName: profile?.instituteName || "GDS Training & Aviation Academy",
      phone: profile?.phone || "",
      email: profile?.email || "",
      whatsapp: profile?.whatsapp || "",
      address: profile?.address || {}
    });
  } catch (error) {
    return NextResponse.json(
      { instituteName: "GDS Training & Aviation Academy" },
      { status: 500 }
    );
  }
}
