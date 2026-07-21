import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type Course = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    description: string;
    duration: string;
    certification: string;
    mode: string;
    softwareCovered: string[];
    curriculum: string[];
    careerOutcomes: string[];
    faqs: { question: string; answer: string }[];
    keywords: string[];
    relatedBlogSlugs: string[];
    // LMS Specific Fields
    price?: number;
    discountPrice?: number;
    rating?: number;
    studentCount?: number;
    thumbnail?: string;
    instructorName?: string;
    level?: string;
    category?: string;
};

const NODE_PATH = "cms/courses";

export const getCourses = async (): Promise<Course[]> => {
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
            }));
    } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
};

export const createCourse = async (data: Omit<Course, "id">): Promise<string> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const newRef = push(ref(db, NODE_PATH));
    await update(newRef, data);
    return newRef.key || "";
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    const { id: _, ...updateData } = data;
    await update(ref(db, `${NODE_PATH}/${id}`), updateData);
};

export const deleteCourse = async (id: string): Promise<void> => {
    const db = getFirebaseDatabase();
    if (!db) throw new Error("Database not initialized");

    await remove(ref(db, `${NODE_PATH}/${id}`));
};

export const getCourseBySlug = async (slug: string): Promise<Course | null> => {
    const courses = await getCourses();
    return courses.find(c => c.slug === slug) || null;
};
