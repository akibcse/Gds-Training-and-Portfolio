import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type Blog = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    description: string;
    publishedAt: string;
    author: string;
    keywords: string[];
    content: string[];
    relatedSlugs: string[];
    relatedCourseSlugs?: string[];
};

const NODE_PATH = "cms/blogs";

export const getBlogs = async (): Promise<Blog[]> => {
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
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return [];
    }
};

export const createBlog = async (data: Omit<Blog, "id">): Promise<string> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const newRef = push(ref(db, NODE_PATH));
    await update(newRef, data);
    return newRef.key || "";
};

export const updateBlog = async (id: string, data: Partial<Blog>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const { id: _, ...updateData } = data;
    await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteBlog = async (id: string): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    await remove(ref(db, `${NODE_PATH}/${id}`));
};

export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
    const blogs = await getBlogs();
    return blogs.find(b => b.slug === slug) || null;
};
