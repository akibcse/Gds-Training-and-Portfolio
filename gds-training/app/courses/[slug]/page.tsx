import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import SEO from "@/components/SEO";
import { getBlogBySlug, getCourseBySlug, getCourses, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/structuredData";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [course, seo, override] = await Promise.all([getCourseBySlug(slug), getSeo(), getSeoOverride(`course:${slug}`)]);
  if (!course) {
    return { title: "Course Not Found" };
  }

  const title = `${course.title} in Dhaka`;
  const description = course.description;

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords?.length ? override.keywords : course.keywords,
    alternates: { canonical: override?.canonicalUrl || `${seo.siteUrl}/courses/${course.slug}` },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/courses/${course.slug}`,
      type: "article"
    },
    twitter: { card: "summary_large_image", title, description }
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const [course, seo] = await Promise.all([getCourseBySlug(slug), getSeo()]);

  if (!course) {
    notFound();
  }

  const relatedBlogs = course.relatedBlogSlugs 
    ? (
        await Promise.all(course.relatedBlogSlugs.map((relatedSlug) => getBlogBySlug(relatedSlug)))
      ).filter((blog): blog is NonNullable<typeof blog> => Boolean(blog))
    : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <SEO id="course-schema" data={courseSchema(course, seo.siteUrl)} />
      <SEO id="course-faq-schema" data={faqSchema(course.faqs || [])} />
      <SEO
        id="course-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Courses", url: `${seo.siteUrl}/courses` },
          { name: course.title, url: `${seo.siteUrl}/courses/${course.slug}` }
        ])}
      />

      <div className="mb-5 flex flex-wrap gap-3 text-sm text-aviation-700">
        <Link href="/" className="underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/courses" className="underline">
          All Courses
        </Link>
      </div>

      <h1 className="font-[var(--font-serif)] text-4xl text-ink">{course.title}</h1>
      <p className="mt-4 max-w-4xl text-sm text-ink/85">{course.description}</p>

      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-aviation-700">
        <span className="rounded-full bg-aviation-100 px-3 py-1">Duration: {course.duration}</span>
        <span className="rounded-full bg-aviation-100 px-3 py-1">Mode: {course.mode}</span>
        <span className="rounded-full bg-aviation-100 px-3 py-1">Certification: {course.certification}</span>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-aviation-100 bg-white p-6 md:col-span-2">
          <h2 className="text-2xl font-semibold text-ink">Course Curriculum Overview</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-ink/85">
            {course.curriculum?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-ink">Career Outcomes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-ink/85">
            {course.careerOutcomes?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-ink">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-3">
            {course.faqs?.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-aviation-100 p-4">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm text-ink/80">{faq.answer}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-2xl font-semibold text-ink">Related Blogs</h2>
          <div className="mt-3 space-y-2 text-sm text-aviation-700">
            {relatedBlogs.map((blog) => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} className="block underline">
                {blog.title}
              </Link>
            ))}
          </div>
        </article>

        <div>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
