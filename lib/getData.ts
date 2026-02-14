import { promises as fs } from "fs";
import path from "path";

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

const dataPath = path.join(process.cwd(), "data");

const loadJson = async <T>(fileName: string): Promise<T> => {
  const file = await fs.readFile(path.join(dataPath, fileName), "utf-8");
  return JSON.parse(file) as T;
};

export const getProfile = () => loadJson<Profile>("profile.json");
export const getCourses = () => loadJson<Course[]>("courses.json");
export const getBlogs = () => loadJson<Blog[]>("blogs.json");
export const getTestimonials = () => loadJson<Testimonial[]>("testimonials.json");
export const getSeo = () => loadJson<Seo>("seo.json");
export const getPortfolio = () => loadJson<Portfolio>("portfolio.json");
export const getPortfolioProjects = () => loadJson<PortfolioProject[]>("projects.json");
export const getSeoPages = () => loadJson<SeoPageEntry[]>("seo-pages.json");

export const getCourseBySlug = async (slug: string) => {
  const courses = await getCourses();
  return courses.find((course) => course.slug === slug) ?? null;
};

export const getBlogBySlug = async (slug: string) => {
  const blogs = await getBlogs();
  return blogs.find((blog) => blog.slug === slug) ?? null;
};
