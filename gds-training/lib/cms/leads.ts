import { ref, get, push, update, remove, query, orderByChild } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type LeadStatus = "New" | "Contacted" | "Converted";

export type Lead = {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    course: string;
    status: LeadStatus;
    notes?: string;
    createdAt: string;
};

const NODE_PATH = "cms/leads";

export const getLeads = async (): Promise<Lead[]> => {
    const db = getFirebaseDatabase();
    if (!db) return [];

    try {
        const snapshot = await get(ref(db, NODE_PATH));
        const data = snapshot.val();

        if (!data) return [];

        return Object.entries(data)
            .map(([key, value]) => ({
                id: key,
                ...(value as any)
            }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Error fetching leads:", error);
        return [];
    }
};

export const createLead = async (data: Omit<Lead, "id" | "status" | "createdAt">): Promise<string> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const newLead: Omit<Lead, "id"> = {
        ...data,
        status: "New",
        createdAt: new Date().toISOString()
    };

    const newRef = push(ref(db, NODE_PATH));
    await update(newRef, newLead);
    return newRef.key || "";
};

export const updateLead = async (id: string, data: Partial<Lead>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const { id: _, ...updateData } = data;
    await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteLead = async (id: string): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    await remove(ref(db, `${NODE_PATH}/${id}`));
};
