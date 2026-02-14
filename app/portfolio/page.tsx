import type { Metadata } from "next";
import Link from "next/link";
import { getPortfolioProjects, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, override] = await Promise.all([getSeo(), getSeoOverride("portfolio")]);
  const title = "Portfolio Projects";
  const description = "Explore portfolio projects, case studies, technologies, and outcomes.";

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords ?? ["portfolio", "case study", "projects"],
    alternates: { canonical: override?.canonicalUrl || "/portfolio" },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/portfolio`
    }
  };
}

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <h1 className="font-[var(--font-serif)] text-4xl text-ink">Portfolio Projects</h1>
      <p className="mt-3 text-sm text-ink/80">Filtered and editable project case studies.</p>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-aviation-700">{project.category || "General"}</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{project.title}</h2>
            <p className="mt-2 text-sm text-ink/80">{project.description}</p>
            <Link href={`/portfolio/${project.slug}`} className="mt-3 inline-flex text-sm font-semibold text-aviation-700 underline">
              View case study
            </Link>
          </article>
        ))}
      </div>
      {projects.length === 0 ? <p className="mt-6 text-sm text-ink/70">No projects added yet.</p> : null}
    </section>
  );
}
