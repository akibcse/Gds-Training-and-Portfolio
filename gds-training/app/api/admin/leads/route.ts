import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getLeads, createLead } from "@/lib/cms/leads";

export async function GET() {
  const items = await getLeads();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  // Public route for lead submission
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: "Name, Email, and Phone are required." }, { status: 400 });
    }

    const id = await createLead(body);
    return NextResponse.json({ id, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
