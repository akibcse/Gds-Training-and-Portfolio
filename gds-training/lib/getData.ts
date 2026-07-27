import { readJsonFile, readJsonObject } from "./storage";
import { getNavbar } from "./cms/navbar";
import { getFooterItems } from "./cms/footer";
import { getGlobalSeo, getPageSeo } from "./cms/seo";
import { getCourses as getCmsCourses, getCourseBySlug as getCmsCourseBySlug } from "./cms/courses";
import { getBlogs as getCmsBlogs, getBlogBySlug as getCmsBlogBySlug } from "./cms/blogs";
import { getPortfolioProjects as getCmsPortfolioProjects } from "./cms/portfolio";

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

import type { Course, CourseModule, ModuleLesson, CourseFaq } from "./cms/courses";
export type { Course, CourseModule, ModuleLesson, CourseFaq };

export function normalizeCourse(c: Partial<Course> | null | undefined): Course {
  if (!c) {
    return {
      id: "",
      slug: "",
      title: "Untitled Course",
      excerpt: "",
      description: "",
      instructorName: "Aviation Expert",
      instructorImage: "",
      thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
      previewVideo: "",
      category: "Aviation & GDS",
      level: "Beginner",
      duration: "Self-Paced",
      language: "English / Bangla",
      mode: "Online & Offline",
      certification: "Verified Certificate",
      rating: 4.8,
      reviewCount: 125,
      studentCount: 1250,
      price: 5000,
      discountPrice: 2500,
      discount: 50,
      hideFee: false,
      badgeText: "Bestseller",
      bestseller: true,
      featured: false,
      published: true,
      certificate: true,
      curriculum: [],
      learningOutcomes: [],
      requirements: [],
      softwareCovered: [],
      tags: [],
      faqs: [],
      relatedBlogSlugs: [],
      seoTitle: "",
      seoDescription: "",
      keywords: []
    };
  }

  const price = c.price ?? 5000;
  const discountPrice = c.discountPrice ?? 2500;
  const computedDiscount = c.discount ?? (price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);
  const hideFee = c.hideFee ?? false;

  // Normalize curriculum if it's an array of strings (legacy) or CourseModule[]
  let normalizedCurriculum: CourseModule[] = [];
  if (Array.isArray(c.curriculum)) {
    if (c.curriculum.length > 0 && typeof c.curriculum[0] === "string") {
      normalizedCurriculum = [
        {
          id: "mod-legacy",
          title: "Course Curriculum Overview",
          duration: c.duration || "Full Course",
          lessons: (c.curriculum as string[]).map((title, idx) => ({
            id: `les-${idx}`,
            title,
            duration: "Lesson " + (idx + 1)
          }))
        }
      ];
    } else {
      normalizedCurriculum = c.curriculum as CourseModule[];
    }
  }

  const outcomes = c.learningOutcomes?.length ? c.learningOutcomes : (c.careerOutcomes || []);

  return {
    id: c.id || "",
    slug: c.slug || "",
    title: c.title || "Untitled Course",
    excerpt: c.excerpt || "",
    description: c.description || "",
    instructorName: c.instructorName || "Aviation Expert",
    instructorImage: c.instructorImage || "",
    thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
    previewVideo: c.previewVideo || "",
    category: c.category || "Aviation & GDS",
    level: c.level || "Beginner",
    duration: c.duration || "3 Months",
    language: c.language || "English / Bangla",
    mode: c.mode || "Online & Offline",
    certification: c.certification || "Verified Certificate",
    rating: c.rating ?? 4.8,
    reviewCount: c.reviewCount ?? c.studentCount ?? 125,
    studentCount: c.studentCount ?? 1250,
    price,
    discountPrice,
    discount: computedDiscount,
    hideFee,
    badgeText: c.badgeText || (c.bestseller ? "Bestseller" : c.featured ? "Featured" : ""),
    bestseller: c.bestseller ?? false,
    featured: c.featured ?? false,
    published: c.published ?? true,
    certificate: c.certificate ?? true,
    curriculum: normalizedCurriculum,
    learningOutcomes: outcomes,
    careerOutcomes: outcomes,
    requirements: c.requirements || [],
    softwareCovered: c.softwareCovered || [],
    tags: c.tags || c.softwareCovered || [],
    faqs: c.faqs || [],
    relatedBlogSlugs: c.relatedBlogSlugs || [],
    seoTitle: c.seoTitle || c.title || "",
    seoDescription: c.seoDescription || c.excerpt || "",
    keywords: c.keywords || [],
    updatedAt: c.updatedAt,
    createdAt: c.createdAt
  };
}

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

// --- Updated to use CMS Modules ---
export const getProfile = async () => (await loadJsonObject<Profile>("profile.json"))!;
export const getBlogs = () => getCmsBlogs();
export const getTestimonials = () => loadJson<Testimonial[]>("testimonials.json");
export const getSeo = async () => (await getGlobalSeo()) as Seo;
export const getPortfolio = async () => (await loadJsonObject<Portfolio>("portfolio.json"))!;
export const getPortfolioProjects = () => getCmsPortfolioProjects();
export const getSeoPages = async (): Promise<SeoPageEntry[]> => [];

export const getCourses = async (): Promise<Course[]> => {
  const raw = await getCmsCourses();
  return raw.map((c) => normalizeCourse(c));
};

export const getCourseBySlug = async (slug: string): Promise<Course | null> => {
  const raw = await getCmsCourseBySlug(slug);
  return raw ? normalizeCourse(raw) : null;
};

export const getBlogBySlug = async (slug: string) => {
  return await getCmsBlogBySlug(slug) as Blog;
};

// Exporting Navbar items getter for any other consumers
export const getNavbarItems = () => getNavbar();
export const getFooterSections = () => getFooterItems();
