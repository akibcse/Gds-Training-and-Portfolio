import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { migrateLegacyToCms } from "@/lib/cms/migrate";

export async function POST() {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await migrateLegacyToCms();

    if (result.success) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json(result, { status: 500 });
    }
}
