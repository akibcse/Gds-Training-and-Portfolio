import { NextResponse } from "next/server";
import { getFirebaseDatabase } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export async function GET() {
  const db = getFirebaseDatabase();
  if (!db) return NextResponse.json({ error: "No DB" });

  const snapshot = await get(ref(db, "courses"));
  const val = snapshot.val();

  return NextResponse.json({
    type: Array.isArray(val) ? "array" : typeof val,
    keys: val ? Object.keys(val) : [],
    data: val
  });
}
