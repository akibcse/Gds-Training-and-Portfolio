import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getBlogs, getCourses, getPortfolioProjects, getSeo } from "@/lib/getData";

const DEFAULT_URL = "https://training.airtechaviation.click";

const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return DEFAULT_URL;

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_URL;
  }
};

const resolveBaseUrl = async () => {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");

    if (host) {
      const protocol = h.get("x-forwarded-proto") || "https";
      return normalizeBaseUrl(`${protocol}://${host}`);
    }
  } catch {
    // no-op: fallback to CMS/default URL below
  }

  try {
    const seo = await getSeo();
    return normalizeBaseUrl(seo?.siteUrl);
  } catch (e) {
    console.error("Sitemap: Failed to get SEO settings", e);
    return DEFAULT_URL;
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await resolveBaseUrl();

  let courses: any[] = [];
  let blogs: any[] = [];
  let projects: any[] = [];

  try {
    courses = await getCourses() || [];
  } catch (e) {
    console.error("Sitemap: Failed to get courses", e);
  }

  try {
    blogs = await getBlogs() || [];
  } catch (e) {
    console.error("Sitemap: Failed to get blogs", e);
  }

  try {
    projects = await getPortfolioProjects() || [];
  } catch (e) {
    console.error("Sitemap: Failed to get projects", e);
  }

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/about", "/contact", "/courses", "/blog", "/portfolio"].map((route) => ({
    url: new URL(route, `${siteUrl}/`).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : route === "/courses" ? 0.9 : route === "/blog" ? 0.8 : 0.75
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses
    .filter((course) => typeof course?.slug === "string" && course.slug.length > 0)
    .map((course) => ({
    url: new URL(`/courses/${course.slug}`, `${siteUrl}/`).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((blog) => typeof blog?.slug === "string" && blog.slug.length > 0)
    .map((blog) => ({
    url: new URL(`/blog/${blog.slug}`, `${siteUrl}/`).toString(),
    lastModified: Number.isNaN(new Date(blog.publishedAt).getTime()) ? new Date() : new Date(blog.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => typeof project?.slug === "string" && project.slug.length > 0)
    .map((project) => ({
    url: new URL(`/portfolio/${project.slug}`, `${siteUrl}/`).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65
  }));

  return [...staticRoutes, ...courseRoutes, ...blogRoutes, ...portfolioRoutes];
}
