import { readJsonFileOrDefault, writeJsonFile } from "@/lib/storage";

export type ProfileRecord = {
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

export type PortfolioProfileRecord = {
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

export type CourseRecord = {
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
};

export type BlogRecord = {
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

export type LeadUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  latestCourse: string;
  source: "registration" | "booking";
  status: "new" | "contacted" | "enrolled";
  updatedAt: string;
};

export type SeoGlobal = {
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

export const FILES = {
  courses: "courses.json",
  blogs: "blogs.json",
  projects: "projects.json",
  users: "users.json",
  profile: "profile.json",
  portfolioProfile: "portfolio.json",
  seoGlobal: "seo.json",
  seoPages: "seo-pages.json"
} as const;

export const getCourses = () => readJsonFileOrDefault<CourseRecord[]>(FILES.courses, []);
export const setCourses = (rows: CourseRecord[]) => writeJsonFile(FILES.courses, rows);

export const getBlogs = () => readJsonFileOrDefault<BlogRecord[]>(FILES.blogs, []);
export const setBlogs = (rows: BlogRecord[]) => writeJsonFile(FILES.blogs, rows);

export const getProjects = () => readJsonFileOrDefault<PortfolioProject[]>(FILES.projects, []);
export const setProjects = (rows: PortfolioProject[]) => writeJsonFile(FILES.projects, rows);

export const getLeadUsers = () => readJsonFileOrDefault<LeadUser[]>(FILES.users, []);
export const setLeadUsers = (rows: LeadUser[]) => writeJsonFile(FILES.users, rows);

export const getProfileRecord = () =>
  readJsonFileOrDefault<ProfileRecord>(FILES.profile, {
    name: "",
    tagline: "",
    headline: "",
    description: "",
    phone: "",
    email: "",
    whatsapp: "",
    address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    },
    experienceYears: 0,
    studentsTrained: 0,
    jobPlacementSupport: false
  });

export const setProfileRecord = (row: ProfileRecord) => writeJsonFile(FILES.profile, row);

export const getPortfolioProfileRecord = () =>
  readJsonFileOrDefault<PortfolioProfileRecord>(FILES.portfolioProfile, {
    fullName: "",
    profileImage: "",
    location: "",
    phones: [],
    email: "",
    careerObjective: "",
    careerSummary: [],
    specialQualification: "",
    experience: [],
    education: [],
    trainings: [],
    professionalQualification: "",
    skills: [],
    languages: []
  });

export const setPortfolioProfileRecord = (row: PortfolioProfileRecord) => writeJsonFile(FILES.portfolioProfile, row);

export const getSeoGlobal = () => readJsonFileOrDefault<SeoGlobal>(FILES.seoGlobal, {
  siteUrl: "https://example.com",
  siteName: "Training Institute",
  defaultTitle: "Training Institute",
  titleTemplate: "%s | Training Institute",
  defaultDescription: "Practical training and career-ready programs.",
  defaultKeywords: [],
  twitterHandle: "",
  locale: "en_US",
  twitterCard: "summary_large_image"
});

export const setSeoGlobal = (row: SeoGlobal) => writeJsonFile(FILES.seoGlobal, row);

export const getSeoPages = () => readJsonFileOrDefault<SeoPageEntry[]>(FILES.seoPages, []);
export const setSeoPages = (rows: SeoPageEntry[]) => writeJsonFile(FILES.seoPages, rows);

export const listFromCsvInput = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
