import { ref, get, push, update, remove, query, orderByChild } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type NavbarItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

const NODE_PATH = "cms/navbar";

export const getNavbar = async (): Promise<NavbarItem[]> => {
  const db = getFirebaseDatabase();
  if (!db) return [];

  try {
    const snapshot = await get(ref(db, NODE_PATH));
    const data = snapshot.val();
    
    if (!data) return [];

    return Object.entries(data)
      .map(([key, value]) => ({
        ...(value as any),
        id: key
      }))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error fetching navbar:", error);
    return [];
  }
};

export const createNavbarItem = async (data: Omit<NavbarItem, "id">): Promise<string> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const newRef = push(ref(db, NODE_PATH));
  await update(newRef, data);
  return newRef.key || "";
};

export const updateNavbarItem = async (id: string, data: Partial<NavbarItem>): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const { id: _, ...updateData } = data;
  await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteNavbarItem = async (id: string): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  await remove(ref(db, `${NODE_PATH}/${id}`));
};
