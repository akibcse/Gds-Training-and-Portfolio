import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SEO from "@/components/SEO";
import { getPortfolioProjects, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { breadcrumbSchema } from "@/lib/structuredData";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getPortfolioProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [projects, seo, override] = await Promise.all([getPortfolioProjects(), getSeo(), getSeoOverride(`portfolio:${slug}`)]);
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return { title: "Portfolio Not Found" };
  }

  return {
    title: override?.metaTitle || project.title,
    description: override?.metaDescription || project.description,
    keywords: override?.keywords ?? project.technologies,
    alternates: { canonical: override?.canonicalUrl || `/portfolio/${project.slug}` },
    openGraph: {
      title: override?.ogTitle || `${project.title} | ${seo.siteName}`,
      description: override?.ogDescription || project.description,
      url: `${seo.siteUrl}/portfolio/${project.slug}`,
      type: "article"
    }
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const [projects, seo] = await Promise.all([getPortfolioProjects(), getSeo()]);
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-14 md:px-6">
      <SEO
        id="portfolio-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Portfolio", url: `${seo.siteUrl}/portfolio` },
          { name: project.title, url: `${seo.siteUrl}/portfolio/${project.slug}` }
        ])}
      />

      <p className="text-xs font-semibold uppercase tracking-wide text-aviation-700">{project.category || "General"}</p>
      <h1 className="mt-2 font-[var(--font-serif)] text-4xl text-ink">{project.title}</h1>
      <p className="mt-4 text-sm text-ink/85">{project.description}</p>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Case Study</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">{project.caseStudy}</p>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Technologies</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span key={tech} className="rounded-full bg-aviation-100 px-3 py-1 text-xs font-semibold text-aviation-700">
            {tech}
          </span>
        ))}
      </div>
    </article>
  );
}
