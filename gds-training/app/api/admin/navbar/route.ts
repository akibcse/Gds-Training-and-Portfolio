import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin";

export type NavbarItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_NAVBAR: NavbarItem[] = [
  { id: "1", label: "Home", url: "/", order: 1, isActive: true },
  { id: "2", label: "Courses", url: "/courses", order: 2, isActive: true },
  { id: "3", label: "Blog", url: "/blog", order: 3, isActive: true },
  { id: "4", label: "Portfolio", url: "/portfolio", order: 4, isActive: true },
  { id: "5", label: "About", url: "/about", order: 5, isActive: true },
  { id: "6", label: "Contact", url: "/contact", order: 6, isActive: true }
];

export async function GET() {
  const items = await readJsonFile<NavbarItem[]>("navbar.json");
  if (!items || items.length === 0) {
    return NextResponse.json(DEFAULT_NAVBAR);
  }
  return NextResponse.json(items.sort((a, b) => a.order - b.order));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<NavbarItem, "id">;
  
  if (!body.label || !body.url) {
    return NextResponse.json({ error: "Label and URL are required." }, { status: 400 });
  }

  const items = await readJsonFile<NavbarItem[]>("navbar.json");
  const newItem: NavbarItem = {
    id: crypto.randomUUID(),
    label: body.label,
    url: body.url,
    order: body.order ?? items.length + 1,
    isActive: body.isActive ?? true
  };

  await writeJsonFile("navbar.json", [...items, newItem]);
  return NextResponse.json(newItem);
}
