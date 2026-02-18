import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get, push, ref, set } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

export type FooterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_FOOTER: FooterSection[] = [
  {
    id: "1",
    title: "About",
    content:
      "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.",
    order: 1,
    isActive: true
  },
  {
    id: "2",
    title: "Quick Links",
    content:
      "<ul class=\"mt-2 space-y-2 text-sm text-ink/80\"><li><a href=\"/\">Home</a></li><li><a href=\"/courses\">All Courses</a></li><li><a href=\"/about\">About</a></li><li><a href=\"/contact\">Contact</a></li><li><a href=\"https://facebook.com/roadyakib\" target=\"_blank\" rel=\"noreferrer\">Facebook</a></li><li><a href=\"https://linkedin.com/in/akibcse\" target=\"_blank\" rel=\"noreferrer\">LinkedIn</a></li></ul>",
    order: 2,
    isActive: true
  },
  {
    id: "3",
    title: "Lead Desk",
    content:
      "<p class=\"mt-2 text-sm text-ink/80\">Email: <a class=\"underline\" href=\"mailto:roadyakib@gmail.com\">roadyakib@gmail.com</a></p><p class=\"text-sm text-ink/80\">Phone: 01521438546</p>",
    order: 3,
    isActive: true
  }
];

const mapFooterObjectToArray = (input: unknown): FooterSection[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input as FooterSection[];
  }

  const records = input as Record<string, Omit<FooterSection, "id">>;
  return Object.entries(records).map(([id, value]) => ({
    id,
    title: value?.title || "",
    content: value?.content || "",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

export async function GET() {
  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json(DEFAULT_FOOTER);
  }

  const snapshot = await get(ref(db, "footer"));
  const sections = mapFooterObjectToArray(snapshot.val());
  if (!sections.length) {
    return NextResponse.json(DEFAULT_FOOTER);
  }

  return NextResponse.json(sections.sort((a, b) => a.order - b.order));
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const body = (await request.json()) as Omit<FooterSection, "id">;
  
  if (!body.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const snapshot = await get(ref(db, "footer"));
  const sections = mapFooterObjectToArray(snapshot.val());
  const payload = {
    title: body.title,
    content: body.content || "",
    order: body.order ?? sections.length + 1,
    isActive: body.isActive ?? true
  };

  const newSectionRef = push(ref(db, "footer"));
  await set(newSectionRef, payload);
  revalidatePath("/");
  return NextResponse.json({ id: newSectionRef.key, ...payload });
}
