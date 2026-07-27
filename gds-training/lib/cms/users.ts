import { ref, get, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type UserRole = "admin" | "instructor" | "student";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  enrolledCourses?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const NODE_PATH = "users";

export const getUsers = async (): Promise<UserProfile[]> => {
  const db = getFirebaseDatabase();
  if (!db) return [];

  try {
    const snapshot = await get(ref(db, NODE_PATH));
    const data = snapshot.val();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => ({
      id: key,
      ...(value as any),
      role: (value as any).role || "student"
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const updateUserRole = async (id: string, role: UserRole): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  await update(ref(db, `${NODE_PATH}/${id}`), {
    role,
    updatedAt: new Date().toISOString()
  });
};

export const updateUserProfile = async (id: string, data: Partial<UserProfile>): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  const { id: _, ...updateData } = data;
  await update(ref(db, `${NODE_PATH}/${id}`), {
    ...updateData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteUserRecord = async (id: string): Promise<void> => {
  const db = getFirebaseDatabase();
  if (!db) throw new Error("Database not initialized");

  await remove(ref(db, `${NODE_PATH}/${id}`));
};
