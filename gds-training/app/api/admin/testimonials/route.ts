import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import type { Testimonial } from "@/lib/getData";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testimonials = await readJsonFile<Testimonial[]>("testimonials.json");
  return NextResponse.json({ testimonials });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { testimonials?: Testimonial[] };
  if (!body.testimonials || !Array.isArray(body.testimonials)) {
    return NextResponse.json({ error: "Invalid testimonials payload" }, { status: 400 });
  }

  const sanitized = body.testimonials
    .map((item) => ({
      name: item.name?.trim() ?? "",
      role: item.role?.trim() ?? "",
      quote: item.quote?.trim() ?? ""
    }))
    .filter((item) => item.name && item.role && item.quote);

  await writeJsonFile("testimonials.json", sanitized);
  return NextResponse.json({ success: true });
}
