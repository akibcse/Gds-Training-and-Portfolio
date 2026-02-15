import type { MetadataRoute } from "next";
import { getBlogs, getCourses, getPortfolioProjects, getSeo } from "@/lib/getData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const DEFAULT_URL = "https://gds-training.vercel.app";
  
  let siteUrl = DEFAULT_URL;
  
  try {
    const seo = await getSeo();
    siteUrl = seo?.siteUrl || DEFAULT_URL;
  } catch (e) {
    console.error("Sitemap: Failed to get SEO settings", e);
  }

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

  const staticRoutes: MetadataRoute.Sitemap = ["", "/about", "/contact", "/courses", "/blog", "/portfolio"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${siteUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.publishedAt || new Date()),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/portfolio/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65
  }));

  return [...staticRoutes, ...courseRoutes, ...blogRoutes, ...portfolioRoutes];
}
