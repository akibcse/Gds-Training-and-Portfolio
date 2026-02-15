import { readJsonFileOrDefault, readJsonObjectOrDefault, writeJsonFile } from "@/lib/storage";

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

export const getCourses = async () => await readJsonFileOrDefault<CourseRecord[]>(FILES.courses, []);
export const getBlogs = async () => await readJsonFileOrDefault<BlogRecord[]>(FILES.blogs, []);
export const getProjects = async () => await readJsonFileOrDefault<PortfolioProject[]>(FILES.projects, []);
export const setProjects = async (rows: PortfolioProject[]) => await writeJsonFile(FILES.projects, rows);
export const getLeadUsers = async () => await readJsonFileOrDefault<LeadUser[]>(FILES.users, []);
export const getProfileRecord = async () =>
  await readJsonObjectOrDefault<ProfileRecord>(FILES.profile, {
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
  readJsonObjectOrDefault<PortfolioProfileRecord>(FILES.portfolioProfile, {
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

export const setPortfolioProfileRecord = async (row: PortfolioProfileRecord) => await writeJsonFile(FILES.portfolioProfile, row);

export const getSeoGlobal = async () => await readJsonObjectOrDefault<SeoGlobal>(FILES.seoGlobal, {
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

export const setSeoGlobal = async (row: SeoGlobal) => await writeJsonFile(FILES.seoGlobal, row);

export const getSeoPages = async () => await readJsonFileOrDefault<SeoPageEntry[]>(FILES.seoPages, []);
export const setSeoPages = async (rows: SeoPageEntry[]) => await writeJsonFile(FILES.seoPages, rows);

export const listFromCsvInput = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
