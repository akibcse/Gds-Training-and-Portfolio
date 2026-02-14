import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SEO from "@/components/SEO";
import { getBlogBySlug, getBlogs, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { blogSchema, breadcrumbSchema } from "@/lib/structuredData";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [blog, seo, override] = await Promise.all([getBlogBySlug(slug), getSeo(), getSeoOverride(`blog:${slug}`)]);
  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: override?.metaTitle || blog.title,
    description: override?.metaDescription || blog.description,
    keywords: override?.keywords?.length ? override.keywords : blog.keywords,
    alternates: { canonical: override?.canonicalUrl || `/blog/${blog.slug}` },
    openGraph: {
      title: override?.ogTitle || `${blog.title} | ${seo.siteName}`,
      description: override?.ogDescription || blog.description,
      url: `${seo.siteUrl}/blog/${blog.slug}`,
      type: "article"
    },
    twitter: { card: "summary_large_image", title: blog.title, description: blog.description }
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const [blog, blogs, seo] = await Promise.all([getBlogBySlug(slug), getBlogs(), getSeo()]);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = blogs.filter((item) => blog.relatedSlugs.includes(item.slug));

  return (
    <article className="mx-auto max-w-4xl px-4 py-14 md:px-6">
      <SEO id="blog-schema" data={blogSchema(blog, seo.siteUrl)} />
      <SEO
        id="blog-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Blog", url: `${seo.siteUrl}/blog` },
          { name: blog.title, url: `${seo.siteUrl}/blog/${blog.slug}` }
        ])}
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-aviation-700">Blog</p>
      <h1 className="mt-2 font-[var(--font-serif)] text-4xl leading-tight text-ink">{blog.title}</h1>
      <p className="mt-3 text-sm text-ink/75">Published on {blog.publishedAt}</p>
      <p className="mt-4 text-sm text-ink/85">{blog.description}</p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink/90">
        {blog.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-aviation-100 bg-white p-6">
        <h2 className="text-2xl font-semibold text-ink">Related Articles</h2>
        <div className="mt-3 space-y-2">
          {relatedBlogs.map((item) => (
            <Link key={item.slug} href={`/blog/${item.slug}`} className="block text-sm text-aviation-700 underline">
              {item.title}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
