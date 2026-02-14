import type { MetadataRoute } from "next";
import { getBlogs, getCourses, getPortfolioProjects, getSeo } from "@/lib/getData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, courses, blogs, projects] = await Promise.all([getSeo(), getCourses(), getBlogs(), getPortfolioProjects()]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/about", "/contact", "/courses", "/blog", "/portfolio"].map((route) => ({
    url: `${seo.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${seo.siteUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${seo.siteUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${seo.siteUrl}/portfolio/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65
  }));

  return [...staticRoutes, ...courseRoutes, ...blogRoutes, ...portfolioRoutes];
}
