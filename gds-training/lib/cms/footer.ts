import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type FooterSection = {
    id: string;
    title: string;
    content: string; // Could be HTML or rich text
    order: number;
    isActive: boolean;
};

const NODE_PATH = "cms/footer";

export const getFooterItems = async (): Promise<FooterSection[]> => {
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
            .filter((section: any) => section.isActive)
            .sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error("Error fetching footer:", error);
        return [];
    }
};

export const createFooterSection = async (data: Omit<FooterSection, "id">): Promise<string> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const newRef = push(ref(db, NODE_PATH));
    await update(newRef, data);
    return newRef.key || "";
};

export const updateFooterSection = async (id: string, data: Partial<FooterSection>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const { id: _, ...updateData } = data;
    await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteFooterSection = async (id: string): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    await remove(ref(db, `${NODE_PATH}/${id}`));
};
