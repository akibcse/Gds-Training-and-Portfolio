import type { Metadata } from "next";
import CourseCard from "@/components/CourseCard";
import SEO from "@/components/SEO";
import { getCourses, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { breadcrumbSchema } from "@/lib/structuredData";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, override] = await Promise.all([getSeo(), getSeoOverride("courses")]);
  const title = "Airline Ticketing Course in Bangladesh | GDS Training";
  const description =
    "Professional Air Ticketing Course and GDS Training in Bangladesh. Master Amadeus, Sabre, and Travelport with job-focused reservation skills and certification.";

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords?.length ? override.keywords : ["Air Ticketing Course", "Amadeus Training", "Travelport Training", "Sabre Training"],
    alternates: { canonical: override?.canonicalUrl || "/courses" },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/courses`
    }
  };
}

export default async function CoursesPage() {
  const [courses, seo] = await Promise.all([getCourses(), getSeo()]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <SEO
        id="courses-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Courses", url: `${seo.siteUrl}/courses` }
        ])}
      />
      <h1 className="font-[var(--font-serif)] text-4xl text-ink">Air Ticketing and GDS Training Courses</h1>
      <p className="mt-3 text-sm text-ink/80">
        Choose from foundation to advanced modules for airline reservation careers.
      </p>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}
