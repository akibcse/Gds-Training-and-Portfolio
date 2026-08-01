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
  instituteName?: string;
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
export const setCourses = async (rows: CourseRecord[]) => await writeJsonFile(FILES.courses, rows);
export const getBlogs = async () => await readJsonFileOrDefault<BlogRecord[]>(FILES.blogs, []);
export const setBlogs = async (rows: BlogRecord[]) => await writeJsonFile(FILES.blogs, rows);
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
    fullName: "Md Akib Hasan",
    profileImage: "https://i.postimg.cc/CLmsxMrM/Photo_of_Md_Akib_Hasan_300x300.jpg",
    location: "Dhaka",
    phones: ["01521438546"],
    email: "roadyakib@gmail.com",
    careerObjective: "Certified GDS Instructor and aviation professional with hands-on experience in airline reservation systems, ticketing operations and aviation training. Expert in Sabre, Galileo with strong classroom and practical training delivery skill.",
    careerSummary: [
      "Certified GDS Instructor with professional expertise in Sabre, Galileo, airline reservation systems",
      "Extensive experience in airline ticketing operations, including PNR creation, fare quotation, ticket issuance, reissue, refund, and cancellation procedures.",
      "Proven ability to deliver classroom-based and hands-on practical training aligned with airline SOP and industry standards",
      "Strong knowledge of fare rules, baggage policies, and passenger documentation requirements"
    ],
    specialQualification: "Certified GDS instructor with hands-on experience in airline reservation systems, ticketing operations, and aviation training. Highly skilled in Sabre and Galileo with strong expertise in PNR management, fare quotation, reissue, and refund.",
    experience: [
      {
        title: "Executive Admin, Instructor",
        organization: "ATTI - Association of Travel Agents of Bangladesh (ATAB)",
        location: "Dhaka",
        duration: "3.3 Years",
        years: "3.3 Years",
        highlights: [
          "Conducting classes on Computer Operations & Global Distribution System (Galileo, Sabre,). Serving as GDS Instructor at ATTI & embracing the role of Executive Admin.",
          "Performing administrative tasks to ensure seamless operations.",
          "Engaging in activities related to academic admission and counselling students about various courses.",
          "Acting as a career architect, connecting education and employment opportunities.",
          "Ensuring graduates excel professionally in the aviation and tourism industry.",
          "Providing services to association members, printing IDs and Renewal or Membership Certificates for members.",
          "Modifying member's data upon request and drafting letters to Airlines, Embassies, BTEB, NSDA, etc."
        ]
      },
      {
        title: "Jr. Software Engineer",
        organization: "Global Software Architects (GSA)",
        location: "Dhaka",
        duration: "1 Year",
        years: "1 Year",
        highlights: [
          "Collaborate with cross-functional teams to analyze requirements and translate them into technical specifications.",
          "Write clean, scalable, and well-documented code following best practices using ASP.NET C# and MVC.",
          "Implement and maintain server-side logic, ensuring high performance and responsiveness.",
          "Develop dynamic and responsive user interfaces using Angular, JavaScript, HTML, and CSS.",
          "Design and optimize database schemas, write complex queries, and work with relational databases such as SQL Server."
        ]
      }
    ],
    education: [
      {
        exam: "Bachelor of Science (BSc)",
        institute: "Eastern University",
        result: "",
        year: ""
      },
      {
        exam: "HSC",
        institute: "Dhaka City College",
        result: "",
        year: ""
      },
      {
        exam: "SSC",
        institute: "University Laboratory School And College",
        result: "",
        year: ""
      }
    ],
    trainings: [
      "Product Certification Program",
      "Ticketing and Reservation (NTVQF Level-2)",
      "Web Application Development",
      "NSDA RPL Level2 on Reservation and Air Ticketing AISD Uttara 01 December, 2025 07 January, 2026"
    ],
    professionalQualification: "Certified GDS Instructor",
    skills: ["Air Ticketing", "Sabre", "Galileo", "GDS Training", "PNR Creation", "Fare Quotation", "Ticket Issuance"],
    languages: []
  });

export const setPortfolioProfileRecord = async (row: PortfolioProfileRecord) => await writeJsonFile(FILES.portfolioProfile, row);

export const getSeoGlobal = async () => await readJsonObjectOrDefault<SeoGlobal>(FILES.seoGlobal, {
  siteUrl: "https://akibhasan.online",
  siteName: "Md. Akib Hasan",
  defaultTitle: "Get personalized GDS training from Md. Akib Hasan",
  titleTemplate: "%s | Md. Akib Hasan",
  defaultDescription: "Professional GDS Training and Air Ticketing courses in Bangladesh.",
  defaultKeywords: ["GDS", "Training", "Air Ticketing"],
  twitterHandle: "@akibhasan",
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
