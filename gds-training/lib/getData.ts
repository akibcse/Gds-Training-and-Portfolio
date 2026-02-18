import { readJsonFile, readJsonObject } from "./storage";

export type Profile = {
  name: string;
  tagline: string;
  headline: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  experienceYears: number;
  studentsTrained: number;
  jobPlacementSupport: boolean;
};

export type Course = {
  id?: string;
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
};

export type Blog = {
  id?: string;
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

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export type Portfolio = {
  fullName: string;
  profileImage: string;
  location: string;
  phones: string[];
  email: string;
  careerObjective: string;
  careerSummary: string[];
  specialQualification: string;
  experience: {
    title: string;
    organization: string;
    location: string;
    duration: string;
    years: string;
    highlights: string[];
  }[];
  education: {
    exam: string;
    institute: string;
    result: string;
    year: string;
  }[];
  trainings: string[];
  professionalQualification: string;
  skills: string[];
  languages: {
    name: string;
    reading: string;
    writing: string;
    speaking: string;
  }[];
};

export type Seo = {
  siteUrl: string;
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  twitterHandle: string;
  locale: string;
  defaultOgImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  googleVerification?: string;
  bingVerification?: string;
};

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

export type SeoPageEntry = {
  pageKey: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  structuredDataOn?: boolean;
};

const loadJson = async <T>(fileName: string): Promise<T> => {
  return await readJsonFile<T>(fileName);
};

const loadJsonObject = async <T>(fileName: string): Promise<T | null> => {
  return await readJsonObject<T>(fileName);
};

export const getProfile = async () => (await loadJsonObject<Profile>("profile.json"))!;
export const getCourses = () => loadJson<Course[]>("courses.json");
export const getBlogs = () => loadJson<Blog[]>("blogs.json");
export const getTestimonials = () => loadJson<Testimonial[]>("testimonials.json");
export const getPortfolio = async () => (await loadJsonObject<Portfolio>("portfolio.json"))!;
export const getSeoPages = () => loadJson<SeoPageEntry[]>("seo-pages.json");

import { get, ref } from "firebase/database";
import { db } from "./firebase";

export const getSeo = async () => {
  try {
    const snapshot = await get(ref(db, "seo"));
    const data = snapshot.val();
    return data?.global || {};
  } catch (error) {
    console.error("Failed to fetch SEO:", error);
    return {};
  }
};

export const getPortfolioProjects = async () => {
  try {
    const snapshot = await get(ref(db, "portfolio"));
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value
    }));
  } catch (error) {
    console.error("Failed to fetch Portfolio Projects:", error);
    return [];
  }
};

export const getCourseBySlug = async (slug: string) => {
  try {
    const snapshot = await get(ref(db, "courses"));
    const data = snapshot.val();
    if (!data) return null;

    let courses: any[] = [];
    if (Array.isArray(data)) {
      courses = data.map((item, index) => ({ id: String(index), ...item }));
    } else {
      courses = Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value }));
    }

    return courses.find((course) => course.slug === slug) ?? null;
  } catch (error) {
    console.error("Failed to fetch Course by slug:", error);
    return null;
  }
};

export const getBlogBySlug = async (slug: string) => {
  const blogs = await getBlogs();
  return blogs.find((blog: any) => blog.slug === slug) ?? null;
};
