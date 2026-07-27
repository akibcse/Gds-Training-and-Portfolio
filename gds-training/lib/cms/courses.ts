import { ref, get, push, update, remove } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

export type ModuleLesson = {
  id?: string;
  title: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration?: string;
  isFreePreview?: boolean;
};

export type CourseModule = {
  id?: string;
  title: string;
  duration?: string;
  lessons: ModuleLesson[];
};

export type CourseFaq = {
  question: string;
  answer: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  excerpt: string; // shortDescription
  description: string; // fullDescription

  // Instructor
  instructorName?: string;
  instructorImage?: string;

  // Media
  thumbnail?: string;
  previewVideo?: string;

  // Course Details
  category?: string;
  level?: string;
  duration?: string;
  language?: string;
  mode?: string;
  certification?: string;

  // Statistics
  rating?: number;
  reviewCount?: number;
  studentCount?: number;

  // Pricing
  price?: number; // regularPrice
  discountPrice?: number; // currentPrice
  discount?: number; // discount percentage
  hideFee?: boolean; // toggle to hide course fee

  // Badges & Status
  badgeText?: string;
  bestseller?: boolean;
  featured?: boolean;
  published?: boolean;
  certificate?: boolean;

  // Curriculum & Learning
  curriculum?: CourseModule[] | string[];
  learningOutcomes?: string[]; // careerOutcomes
  careerOutcomes?: string[];
  requirements?: string[];
  softwareCovered?: string[];
  tags?: string[];
  faqs?: CourseFaq[];
  relatedBlogSlugs?: string[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];

  // Timestamps
  updatedAt?: number | string;
  createdAt?: number | string;
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
