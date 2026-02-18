import { NextResponse } from "next/server";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";
import { createAdminSession } from "@/lib/admin";

export async function POST(request: Request) {
    // Use our existing verifier to check the Firebase token
    if (!(await verifyFirebaseAdminRequest(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If Firebase verified, grant the legacy cookie
    await createAdminSession();

    return NextResponse.json({ success: true });
}
