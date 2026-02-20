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
  relatedCourseSlugs?: string[];
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

// --- Updated to use CMS Modules ---
export const getProfile = async () => (await loadJsonObject<Profile>("profile.json"))!;
export const getCourses = () => getCmsCourses();
export const getBlogs = () => getCmsBlogs();
export const getTestimonials = () => loadJson<Testimonial[]>("testimonials.json");
export const getSeo = async () => (await getGlobalSeo()) as Seo;
export const getPortfolio = async () => (await loadJsonObject<Portfolio>("portfolio.json"))!;
export const getPortfolioProjects = () => getCmsPortfolioProjects();
export const getSeoPages = async (): Promise<SeoPageEntry[]> => {
  // This is a mapping adapter for getPageSeo
  // In the real app, we might want to fetch all pages, but typically it's called by slug.
  // For now, returning empty array as individual pages should use getPageSeo directly in their contexts.
  // But lib/seo-settings.ts calls this.
  return [];
};

export const getCourseBySlug = async (slug: string) => {
  return await getCmsCourseBySlug(slug) as Course;
};

export const getBlogBySlug = async (slug: string) => {
  return await getCmsBlogBySlug(slug) as Blog;
};

// Exporting Navbar items getter for any other consumers
export const getNavbarItems = () => getNavbar();
export const getFooterSections = () => getFooterItems();
