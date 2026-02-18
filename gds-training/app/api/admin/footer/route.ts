import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin";

export type FooterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_FOOTER: FooterSection[] = [
  { id: "1", title: "About", content: "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.", order: 1, isActive: true },
  { id: "2", title: "Quick Links", content: "", order: 2, isActive: true },
  { id: "3", title: "Lead Desk", content: "", order: 3, isActive: true }
];

export async function GET() {
  const sections = await readJsonFile<FooterSection[]>("footer.json");
  if (!sections || sections.length === 0) {
    return NextResponse.json(DEFAULT_FOOTER);
  }
  return NextResponse.json(sections.sort((a, b) => a.order - b.order));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<FooterSection, "id">;
  
  if (!body.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const sections = await readJsonFile<FooterSection[]>("footer.json");
  const newSection: FooterSection = {
    id: crypto.randomUUID(),
    title: body.title,
    content: body.content || "",
    order: body.order ?? sections.length + 1,
    isActive: body.isActive ?? true
  };

  await writeJsonFile("footer.json", [...sections, newSection]);
  revalidatePath("/");
  return NextResponse.json(newSection);
}
