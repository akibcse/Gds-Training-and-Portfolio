import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type PortfolioProject = {
    id: string;
    slug: string;
    title: string;
    category: string;
    description: string;
    caseStudy: string;
    technologies: string[];
    imageUrl: string;
};

const NODE_PATH = "cms/portfolio";

export const getPortfolioProjects = async (): Promise<PortfolioProject[]> => {
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
            }));
    } catch (error) {
        console.error("Error fetching portfolio projects:", error);
        return [];
    }
};

export const createPortfolioProject = async (data: Omit<PortfolioProject, "id">): Promise<string> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const newRef = push(ref(db, NODE_PATH));
    await update(newRef, data);
    return newRef.key || "";
};

export const updatePortfolioProject = async (id: string, data: Partial<PortfolioProject>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const { id: _, ...updateData } = data;
    await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deletePortfolioProject = async (id: string): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    await remove(ref(db, `${NODE_PATH}/${id}`));
};

export const getPortfolioProjectBySlug = async (slug: string): Promise<PortfolioProject | null> => {
    const projects = await getPortfolioProjects();
    return projects.find(p => p.slug === slug) || null;
};
