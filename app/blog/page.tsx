import type { Metadata } from "next";
import Link from "next/link";
import { getBlogs, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, override] = await Promise.all([getSeo(), getSeoOverride("blog")]);
  const title = "GDS Training Blog";
  const description =
    "Read actionable guides on Amadeus Training, Travelport Training, Sabre Training, and career strategies for airline reservation roles.";

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords?.length ? override.keywords : ["How to learn Amadeus GDS", "Best GDS training institute", "Airline Reservation Course"],
    alternates: { canonical: override?.canonicalUrl || "/blog" },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/blog`
    }
  };
}

export default async function BlogIndexPage() {
  const blogs = await getBlogs();

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <h1 className="font-[var(--font-serif)] text-4xl text-ink">GDS Training Blog</h1>
      <p className="mt-3 text-sm text-ink/80">
        Keyword-focused guides for students searching Air Ticketing Course and GDS career success in Bangladesh.
      </p>
      <div className="mt-8 space-y-4">
        {blogs.map((blog) => (
          <article key={blog.slug} className="rounded-2xl border border-aviation-100 bg-white p-5">
            <h2 className="text-xl font-semibold text-ink">{blog.title}</h2>
            <p className="mt-2 text-sm text-ink/80">{blog.excerpt}</p>
            <Link href={`/blog/${blog.slug}`} className="mt-3 inline-flex text-sm font-semibold text-aviation-700 underline">
              Read Article
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
