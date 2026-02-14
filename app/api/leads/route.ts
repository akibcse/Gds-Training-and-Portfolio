import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

type LeadType = "registration" | "booking";

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  course: string;
  type: LeadType;
};

type LeadRecord = LeadPayload & {
  id: string;
  createdAt: string;
};

type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  latestCourse: string;
  source: LeadType;
  status: "new" | "contacted" | "enrolled";
  updatedAt: string;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<LeadPayload>;

  if (!payload.name || !payload.email || !payload.phone || !payload.course || !payload.type) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!isValidEmail(payload.email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (payload.type !== "registration" && payload.type !== "booking") {
    return NextResponse.json({ error: "Invalid lead type." }, { status: 400 });
  }

  const lead: LeadRecord = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    course: payload.course.trim(),
    type: payload.type,
    createdAt: new Date().toISOString()
  };

  const targetFile = payload.type === "registration" ? "registrations.json" : "bookings.json";
  const existingLeads = await readJsonFile<LeadRecord[]>(targetFile);
  await writeJsonFile(targetFile, [lead, ...existingLeads]);

  const users = await readJsonFile<UserRecord[]>("users.json");
  const existingUser = users.find((user) => user.email === lead.email);

  if (existingUser) {
    existingUser.name = lead.name;
    existingUser.phone = lead.phone;
    existingUser.latestCourse = lead.course;
    existingUser.source = lead.type;
    existingUser.updatedAt = lead.createdAt;
  } else {
    users.unshift({
      id: crypto.randomUUID(),
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      latestCourse: lead.course,
      source: lead.type,
      status: "new",
      updatedAt: lead.createdAt
    });
  }

  await writeJsonFile("users.json", users);

  return NextResponse.json({ success: true });
}
