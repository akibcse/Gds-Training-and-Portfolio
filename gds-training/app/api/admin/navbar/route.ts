import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get, push, ref, set } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";
import { verifyFirebaseAdminRequest } from "@/lib/firebase-admin-auth";

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

const mapNavbarObjectToArray = (input: unknown): NavbarItem[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input as NavbarItem[];
  }

  const records = input as Record<string, Omit<NavbarItem, "id">>;
  return Object.entries(records).map(([id, value]) => ({
    id,
    label: value?.label || "",
    url: value?.url || "/",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

export async function GET() {
  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json(DEFAULT_NAVBAR);
  }

  const snapshot = await get(ref(db, "navbar"));
  const items = mapNavbarObjectToArray(snapshot.val());

  if (!items.length) {
    return NextResponse.json(DEFAULT_NAVBAR);
  }

  return NextResponse.json(items.sort((a, b) => a.order - b.order));
}

export async function POST(request: Request) {
  if (!(await verifyFirebaseAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const body = (await request.json()) as Omit<NavbarItem, "id">;
  
  if (!body.label || !body.url) {
    return NextResponse.json({ error: "Label and URL are required." }, { status: 400 });
  }

  const snapshot = await get(ref(db, "navbar"));
  const items = mapNavbarObjectToArray(snapshot.val());

  const payload = {
    label: body.label,
    url: body.url,
    order: body.order ?? items.length + 1,
    isActive: body.isActive ?? true
  };

  const newItemRef = push(ref(db, "navbar"));
  await set(newItemRef, payload);
  revalidatePath("/");
  return NextResponse.json({ id: newItemRef.key, ...payload });
}
